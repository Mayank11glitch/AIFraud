import os
import pandas as pd
import numpy as np
import torch
import evaluate
from datasets import Dataset
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    TrainingArguments, 
    Trainer,
    EarlyStoppingCallback
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

# GPU Auto-Detection
DEVICE = "cpu"

def train_url_model():
    print("Loading synthetic URL dataset...")
    data_path = os.path.join("dataset", "data", "url_dataset.csv")
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Please run generate_dataset.py first.")
        return

    df = pd.read_csv(data_path)
    
    # Map categories: benign -> 0, url_phishing -> 1
    category_map = {
        "benign": 0,
        "url_phishing": 1
    }
    
    df = df[df["category"].isin(category_map.keys())].copy()
    df["label"] = df["category"].map(category_map)
    df = df.dropna(subset=["url", "label"])
    
    print(f"Dataset Size: {len(df)} URLs")
    
    # Convert to HuggingFace Dataset
    hf_dataset = Dataset.from_pandas(df[["url", "label"]])
    
    # Rename 'url' column to 'text' for standard tokenizer compatibility
    hf_dataset = hf_dataset.rename_column("url", "text")
    
    # Split 85/15 train/test with stratification
    hf_dataset = hf_dataset.train_test_split(test_size=0.15, seed=42, stratify=hf_dataset["label"])
    
    # UPGRADED: DistilRoBERTa-base → roberta-base for better performance
    model_name = "roberta-base"
    print(f"Loading Tokenizer: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)
        
    print("Tokenizing URL dataset...")
    tokenized_datasets = hf_dataset.map(tokenize_function, batched=True)
    
    print(f"Loading Model: {model_name}")
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name, 
        num_labels=2,
        id2label={0: "benign", 1: "url_phishing"},
        label2id={"benign": 0, "url_phishing": 1}
    )
    
    metric = evaluate.load("accuracy")
    
    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=-1)
        
        accuracy = accuracy_score(labels, predictions)
        precision, recall, f1, _ = precision_recall_fscore_support(
            labels, predictions, average='weighted', zero_division=0
        )
        cm = confusion_matrix(labels, predictions)
        
        return {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "confusion_matrix": cm.tolist()
        }
        
    output_dir = os.path.join("models", "url-scamdetect-finetuned")
    
    training_args = TrainingArguments(
        output_dir=output_dir,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=32,
        per_device_eval_batch_size=32,
        num_train_epochs=5,
        weight_decay=0.01,
        warmup_ratio=0.1,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        push_to_hub=False,
        fp16=False,
        logging_steps=100,
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
    
    print(f"Starting URL Training on {DEVICE.upper()}...")
    trainer.train()
    
    print("Evaluating URL Model Accuracy...")
    eval_results = trainer.evaluate()
    print(f"Final URL Evaluation Results: {eval_results}")
    
    print(f"Saving Fine-Tuned URL Model to {output_dir}")
    trainer.save_model(output_dir)
    print("URL Training Complete!")

if __name__ == "__main__":
    train_url_model()
