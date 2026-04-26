import os
import pandas as pd
import numpy as np
import evaluate
from datasets import Dataset
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    TrainingArguments, 
    Trainer,
    EarlyStoppingCallback
)
import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

# GPU Auto-Detection
DEVICE = "cpu"

def train_model():
    print("Loading augmented dataset with Hindi/Hinglish samples...")
    data_path = os.path.join("dataset", "data", "text_dataset_augmented.csv")
    df = pd.read_csv(data_path)
    
    # We map the 4 categories from generate_dataset.py into integer labels
    category_map = {
        "benign": 0,
        "phishing": 1,
        "upi_fraud": 2,
        "investment_scam": 3
    }
    
    # Filter only known categories just in case
    df = df[df["category"].isin(category_map.keys())].copy()
    df["label"] = df["category"].map(category_map)
    df = df.dropna(subset=["text", "label"])
    
    # Sample 15000 for faster training on CPU
    df = df.sample(n=15000, random_state=42)
    print(f"Dataset Size: {len(df)} records")
    
    # Convert to HuggingFace Dataset
    hf_dataset = Dataset.from_pandas(df[["text", "label"]])
    
    # Split 85/15 train/test
    hf_dataset = hf_dataset.train_test_split(test_size=0.15, seed=42)
    
    # UPGRADED: DistilBERT → RoBERTa-base for better performance
    # RoBERTa is specifically trained on web text and handles noisy input better
    model_name = "roberta-base"
    print(f"Loading Tokenizer: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)
        
    print("Tokenizing dataset...")
    tokenized_datasets = hf_dataset.map(tokenize_function, batched=True)
    
    print(f"Loading Model: {model_name}")
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name, 
        num_labels=4,
        id2label={v: k for k, v in category_map.items()},
        label2id=category_map
    )
    
    metric = evaluate.load("accuracy")
    
    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=-1)
        
        # Comprehensive metrics
        accuracy = accuracy_score(labels, predictions)
        precision, recall, f1, _ = precision_recall_fscore_support(
            labels, predictions, average='weighted', zero_division=0
        )
        
        # Per-class metrics
        precision_per_class, recall_per_class, f1_per_class, _ = precision_recall_fscore_support(
            labels, predictions, average=None, zero_division=0
        )
        
        # Confusion matrix
        cm = confusion_matrix(labels, predictions)
        
        return {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "confusion_matrix": cm.tolist(),
            "per_class_precision": precision_per_class.tolist(),
            "per_class_recall": recall_per_class.tolist(),
            "per_class_f1": f1_per_class.tolist()
        }
        
    output_dir = os.path.join("models", "scamdetect-finetuned")
    
    training_args = TrainingArguments(
        output_dir=output_dir,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=3,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        push_to_hub=False,
        fp16=False,
        logging_steps=200,
        report_to=["none"],
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets["test"],
        processing_class=tokenizer,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)]
    )
    
    print(f"Starting Training on {DEVICE.upper()}...")
    trainer.train()
    
    print("Evaluating Model Accuracy...")
    eval_results = trainer.evaluate()
    print(f"Final Evaluation Results: {eval_results}")
    
    print(f"Saving Fine-Tuned Model to {output_dir}")
    trainer.save_model(output_dir)
    print("Training Complete!")

if __name__ == "__main__":
    train_model()
