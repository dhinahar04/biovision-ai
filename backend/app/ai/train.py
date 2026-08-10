import os
import sys
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import torchvision.models as models
def custom_stratified_split(file_paths, labels, test_size=0.2, random_state=42):
    import random
    random.seed(random_state)
    label_to_items = {}
    for path, label in zip(file_paths, labels):
        if label not in label_to_items:
            label_to_items[label] = []
        label_to_items[label].append(path)
    train_files, val_files = [], []
    train_labels, val_labels = [], []
    for label, files in label_to_items.items():
        shuffled = list(files)
        random.shuffle(shuffled)
        split_idx = int(len(shuffled) * (1 - test_size))
        if split_idx == len(shuffled) and len(shuffled) > 1:
            split_idx -= 1
        train_files.extend(shuffled[:split_idx])
        val_files.extend(shuffled[split_idx:])
        train_labels.extend([label] * split_idx)
        val_labels.extend([label] * (len(shuffled) - split_idx))
    return train_files, val_files, train_labels, val_labels
from PIL import Image
import cv2
import numpy as np

# Adjust path to import preprocess
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.ai.preprocess import enhance_fingerprint

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")

class FingerprintDataset(Dataset):
    def __init__(self, file_paths, labels, transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        path = self.file_paths[idx]
        label = self.labels[idx]

        try:
            # Load raw image bytes
            with open(path, "rb") as f:
                img_bytes = f.read()
            
            # Apply OpenCV enhancements
            _, enhanced, _ = enhance_fingerprint(img_bytes)
            
            # Convert single channel grayscale to 3-channel RGB for pretrained models
            rgb_img = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2RGB)
            pil_img = Image.fromarray(rgb_img)
        except Exception as e:
            # Fallback to standard PIL load
            # print(f"Error preprocessing {path}: {e}", file=sys.stderr)
            pil_img = Image.open(path).convert("RGB")

        if self.transform:
            pil_img = self.transform(pil_img)

        return pil_img, label

def load_dataset(dataset_path):
    """
    Scans dataset_path and gathers image paths and corresponding blood group labels.
    """
    classes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    file_paths = []
    labels = []

    # Map class strings to integers
    class_to_idx = {cls: idx for idx, cls in enumerate(classes)}

    for cls in classes:
        cls_dir = os.path.join(dataset_path, cls)
        if not os.path.isdir(cls_dir):
            print(f"Warning: Class directory {cls_dir} not found. Skipping.", file=sys.stderr)
            continue
        
        for root, _, files in os.walk(cls_dir):
            for file in files:
                if file.lower().endswith((".bmp", ".png", ".jpg", ".jpeg")):
                    file_paths.append(os.path.join(root, file))
                    labels.append(class_to_idx[cls])

    return file_paths, labels, class_to_idx

def train_model(dataset_path: str, output_model_dir: str, epochs: int = 5, batch_size: int = 32, lr: float = 1e-4, architecture: str = "efficientnet_b0", progress_callback=None):
    """
    Standard transfer learning pipeline supporting multiple models
    """
    # 1. Scan and split dataset
    file_paths, labels, class_to_idx = load_dataset(dataset_path)
    if not file_paths:
        raise ValueError(f"No valid fingerprint images found in {dataset_path}")

    # Inverse mapping for saving
    idx_to_class = {v: k for k, v in class_to_idx.items()}

    # Perform stratified split
    train_files, val_files, train_labels, val_labels = custom_stratified_split(
        file_paths, labels, test_size=0.2, random_state=42
    )

    # 2. Define transforms
    train_transform = transforms.Compose([
        transforms.RandomRotation(15),
        transforms.RandomHorizontalFlip(),
        transforms.RandomAffine(degrees=15, translate=(0.05, 0.05), scale=(0.8, 1.2)),
        transforms.ColorJitter(brightness=0.3, contrast=0.3),
        transforms.GaussianBlur(kernel_size=(5, 5), sigma=(0.1, 1.5)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # 3. Create Datasets and Dataloaders
    train_dataset = FingerprintDataset(train_files, train_labels, transform=train_transform)
    val_dataset = FingerprintDataset(val_files, val_labels, transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # 4. Initialize model
    print(f"Loading pretrained {architecture} model on device: {device}...")
    if architecture == "mobilenet_v2":
        try:
            from torchvision.models import mobilenet_v2, MobileNet_V2_Weights
            model = mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)
        except ImportError:
            model = models.mobilenet_v2(pretrained=True)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, len(class_to_idx))
    elif architecture == "resnet50":
        try:
            from torchvision.models import resnet50, ResNet50_Weights
            model = resnet50(weights=ResNet50_Weights.DEFAULT)
        except ImportError:
            model = models.resnet50(pretrained=True)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, len(class_to_idx))
    else: # efficientnet_b0
        try:
            from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
            model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
        except ImportError:
            model = models.efficientnet_b0(pretrained=True)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, len(class_to_idx))

    model = model.to(device)

    # 5. Optimizer and loss
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    # Ensure output model directory exists
    os.makedirs(output_model_dir, exist_ok=True)

    best_acc = 0.0
    training_history = []

    for epoch in range(epochs):
        # Training phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, targets in train_loader:
            images, targets = images.to(device), targets.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total_train += targets.size(0)
            correct_train += predicted.eq(targets).sum().item()

        epoch_train_loss = running_loss / len(train_dataset)
        epoch_train_acc = (correct_train / total_train) * 100.0

        # Validation phase
        model.eval()
        val_running_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for val_images, val_targets in val_loader:
                val_images, val_targets = val_images.to(device), val_targets.to(device)
                val_outputs = model(val_images)
                val_loss = criterion(val_outputs, val_targets)

                val_running_loss += val_loss.item() * val_images.size(0)
                _, val_predicted = val_outputs.max(1)
                total_val += val_targets.size(0)
                correct_val += val_predicted.eq(val_targets).sum().item()

        epoch_val_loss = val_running_loss / len(val_dataset)
        epoch_val_acc = (correct_val / total_val) * 100.0
        
        scheduler.step()

        # Save history
        epoch_stats = {
            "epoch": epoch + 1,
            "train_loss": round(epoch_train_loss, 4),
            "train_acc": round(epoch_train_acc, 2),
            "val_loss": round(epoch_val_loss, 4),
            "val_acc": round(epoch_val_acc, 2)
        }
        training_history.append(epoch_stats)

        print(f"Epoch {epoch+1}/{epochs} - Train Loss: {epoch_train_loss:.4f}, Train Acc: {epoch_train_acc:.2f}%, Val Loss: {epoch_val_loss:.4f}, Val Acc: {epoch_val_acc:.2f}%")

        if progress_callback:
            progress_callback(epoch + 1, epochs, epoch_train_loss, epoch_train_acc, epoch_val_loss, epoch_val_acc)

        # Save best model
        if epoch_val_acc > best_acc:
            best_acc = epoch_val_acc
            torch.save(model.state_dict(), os.path.join(output_model_dir, "blood_group_model.pth"))

    # Save classes.json
    classes_meta = {
        "classes": idx_to_class,
        "architecture": architecture
    }
    with open(os.path.join(output_model_dir, "classes.json"), "w") as f:
        json.dump(classes_meta, f, indent=4)

    # Save history log
    with open(os.path.join(output_model_dir, "training_history.json"), "w") as f:
        json.dump(training_history, f, indent=4)

    print(f"Training Complete. Best Validation Accuracy: {best_acc:.2f}%")
    return best_acc, training_history

if __name__ == "__main__":
    # Execute standalone training
    dataset_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../dataset_blood_group"))
    if len(sys.argv) > 1:
        dataset_dir = sys.argv[1]
    
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../models"))
    
    print(f"Starting BioVision AI training using dataset: {dataset_dir}")
    train_model(dataset_path=dataset_dir, output_model_dir=models_dir, epochs=5)
