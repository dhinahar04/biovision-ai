import motor.motor_asyncio
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=2000)
db = client.biovision_db

# Fallback in-memory storage
in_memory_history = []

async def check_mongo():
    try:
        await client.admin.command('ping')
        return True
    except:
        return False

async def save_prediction(prediction_data):
    if await check_mongo():
        try:
            await db.predictions.insert_one(prediction_data)
            return True
        except Exception as e:
            print(f"Error saving to MongoDB: {e}")
    
    # Always fallback to in-memory for demo reliability
    in_memory_history.append(prediction_data)
    return True

async def get_history(limit=50):
    if await check_mongo():
        try:
            cursor = db.predictions.find().sort("timestamp", -1).limit(limit)
            history = []
            async for document in cursor:
                document["id"] = str(document.pop("_id"))
                history.append(document)
            return history
        except:
            pass
            
    return in_memory_history[::-1][:limit]

async def get_analytics_data():
    if await check_mongo():
        try:
            total = await db.predictions.count_documents({})
            if total > 0:
                pipeline = [
                    {"$group": {"_id": "$predicted_class", "count": {"$sum": 1}}}
                ]
                dist_cursor = db.predictions.aggregate(pipeline)
                distribution = {doc["_id"]: doc["count"] async for doc in dist_cursor}
                
                avg_pipeline = [
                    {"$group": {"_id": None, "avg_conf": {"$avg": "$confidence"}}}
                ]
                avg_cursor = db.predictions.aggregate(avg_pipeline)
                avg_result = await avg_cursor.to_list(length=1)
                avg_conf = avg_result[0]["avg_conf"] if avg_result else 0
                
                return {
                    "total_predictions": total,
                    "avg_confidence": avg_conf,
                    "group_distribution": distribution
                }
        except:
            pass
            
    # In-memory analytics
    if not in_memory_history:
        return None
        
    total = len(in_memory_history)
    avg_conf = sum(h["confidence"] for h in in_memory_history) / total
    dist = {}
    for h in in_memory_history:
        cls = h["predicted_class"]
        dist[cls] = dist.get(cls, 0) + 1
        
    return {
        "total_predictions": total,
        "avg_confidence": avg_conf,
        "group_distribution": dist
    }
