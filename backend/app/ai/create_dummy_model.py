import os
import json
import torch
import torch.nn as nn
import torchvision.models as models

# Define output directory
output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../models"))
os.makedirs(output_dir, exist_ok=True)

# Load model architecture
try:
    from torchvision.models import efficientnet_b0
    model = efficientnet_b0(weights=None)
except ImportError:
    model = models.efficientnet_b0(pretrained=False)

# Replace final linear layer
in_features = model.classifier[1].in_features
model.classifier[1] = nn.Linear(in_features, 8)

# Save state dict
torch.save(model.state_dict(), os.path.join(output_dir, "blood_group_model.pth"))

# Save classes.json
classes = {
    "0": "A+",
    "1": "A-",
    "2": "B+",
    "3": "B-",
    "4": "AB+",
    "5": "AB-",
    "6": "O+",
    "7": "O-"
}
with open(os.path.join(output_dir, "classes.json"), "w") as f:
    json.dump(classes, f, indent=4)

print("Dummy model checkpoint and class mapping created successfully at: " + output_dir)
