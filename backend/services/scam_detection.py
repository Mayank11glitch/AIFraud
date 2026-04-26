import uuid
import datetime
import os
import tempfile
import functools
import torch
import urllib.parse
from models.schemas import ScanningResult, FeatureExplanation

# Import ML dependencies
from transformers import pipeline, CLIPProcessor, CLIPModel

# Import Indian Scam Dataset for enhanced scoring
from dataset.loader import get_dataset

# Import GPU Manager for multi-platform support
from services.gpu_manager import GPU_MGR, DEVICE

# Print GPU Status
GPU_MGR.print_status()

# Load Fine-Tuned Custom DistilBERT Model (Highest Accuracy)
try:
    print("Loading Fine-Tuned Custom Scam Classifier...")
    finetuned_classifier = pipeline(
        "text-classification", 
        model=os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "scamdetect-finetuned"),
        device=GPU_MGR.get_device_index(),
        top_k=None  # Returns all scores
    )
    print("Fine-Tuned Custom Model loaded successfully.")
except Exception as e:
    print(f"Fine-Tuned model not found ({e}). Falling back to pure zero-shot.")
    finetuned_classifier = None

# Load Fine-Tuned URL Classification Model (for max trust)
try:
    print("Loading Fine-Tuned URL Classifier...")
    url_classifier = pipeline(
        "text-classification", 
        model=os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "url-scamdetect-finetuned"),
        device=GPU_MGR.get_device_index()
    )
    print("Fine-Tuned URL Model loaded successfully.")
except Exception as e:
    print(f"Fine-Tuned URL model not found ({e}). URL analysis will use heuristics.")
    url_classifier = None

# Load a multilingual zero-shot classification model (100+ languages)
try:
    print("Loading Multilingual mDeBERTa-v3 classification pipeline...")
    nlp_classifier = pipeline(
        "zero-shot-classification", 
        model="MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7",
        device=GPU_MGR.get_device_index()
    )
    print("Multilingual mDeBERTa-v3 loaded successfully (100+ languages).")
except Exception as e:
    print(f"Error loading multilingual model: {e}")
    print("Falling back to BART-large-MNLI (English only)...")
    try:
        nlp_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=GPU_MGR.get_device_index())
        print("Fallback BART model loaded.")
    except Exception as e2:
        print(f"Fallback also failed: {e2}")
        nlp_classifier = None

# Load CLIP model for visual classification of images/video frames
try:
    print("Loading CLIP visual classification model...")
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(GPU_MGR.get_device())
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    print(f"CLIP model loaded successfully (on {DEVICE.upper()}).")
except Exception as e:
    print(f"Error loading CLIP model: {e}")
    clip_model = None
    clip_processor = None

# Load Whisper model for audio transcription
try:
    import whisper
    print("Loading Whisper 'tiny' model...")
    # Whisper supports: "cuda", "cpu", "mps"
    whisper_device = "cuda" if DEVICE == "cuda" else ("mps" if DEVICE == "mps" else "cpu")
    whisper_model = whisper.load_model("tiny", device=whisper_device)
    print(f"Whisper model loaded successfully (on {DEVICE.upper()}).")
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    whisper_model = None

# Load Deepfake Detection Model (ViT-based) - Use working model
try:
    print("Loading Deepfake Detection model...")
    from transformers import AutoImageProcessor, AutoModelForImageClassification
    # Try a different model that supports image classification properly
    deepfake_processor = AutoImageProcessor.from_pretrained("hamzenium/ViT-Deepfake-Classifier")
    deepfake_model = AutoModelForImageClassification.from_pretrained("hamzenium/ViT-Deepfake-Classifier")
    deepfake_model = deepfake_model.to(GPU_MGR.get_device())
    deepfake_model.eval()
    print(f"Deepfake detector loaded successfully (on {DEVICE.upper()}).")
except Exception as e:
    print(f"Error loading Deepfake model: {e}")
    deepfake_model = None
    deepfake_processor = None

# CLIP labels for scam image classification
CLIP_SCAM_LABELS = [
    "a screenshot of a scam message or phishing attempt",
    "a fake bank payment or UPI transaction screenshot",
    "a fraudulent QR code for payment",
    "a phishing login page asking for credentials",
    "a fake lottery or prize winning notification",
    "a suspicious advertisement for quick money", # End of Scam Labels (Idx 0-5)
    "a legitimate bank SMS or valid transaction notification", # Start of Benign Labels (Idx 6-10)
    "a normal photograph of a person or scenery",
    "a normal screenshot of a legitimate application",
    "a document or receipt with normal content",
    "a meme or casual social media post",
]

CANDIDATE_LABELS = [
    "phishing", 
    "financial scam", 
    "urgency", 
    "legitimate communication",
    "threat or blackmail",
    "authority impersonation",
    "promotional offer",
    "identity theft"
]


def ensemble_analyze_text(text: str, finetuned_classifier, nlp_classifier, ds) -> tuple:
    """
    Ensemble approach: Combine predictions from multiple sources
    1. Fine-tuned RoBERTa model
    2. mDeBERTa zero-shot model
    3. Rule-based keyword matching
    
    Returns weighted average risk score
    """
    weights = {
        "finetuned": 0.50,
        "zeroshot": 0.30,
        "keyword": 0.20
    }
    
    scores = {}
    categories = []
    explanations = []
    
    # 1. Fine-tuned model prediction
    ft_risk = 0.0
    if finetuned_classifier:
        try:
            result_ft = finetuned_classifier(text, top_k=None)
            entries = result_ft[0] if isinstance(result_ft[0], list) else result_ft
            scores_ft = {entry['label']: entry['score'] for entry in entries}
            
            scam_scores = [scores_ft.get("phishing", 0), scores_ft.get("upi_fraud", 0), scores_ft.get("investment_scam", 0)]
            legit_score = scores_ft.get("benign", 0)
            max_scam = max(scam_scores) if scam_scores else 0
            ft_risk = max_scam
            
            for label, score in scores_ft.items():
                if label != "benign" and score > 0.5:
                    categories.append(label.replace("_", " ").title())
            scores["finetuned"] = ft_risk
        except Exception as e:
            print(f"Fine-tuned model error: {e}")
            scores["finetuned"] = 0.0
    
    # 2. Zero-shot model prediction
    zs_risk = 0.0
    if nlp_classifier:
        try:
            result_zs = nlp_classifier(text, CANDIDATE_LABELS, multi_label=True)
            scores_zs = dict(zip(result_zs['labels'], result_zs['scores']))
            
            malicious_scores = [
                scores_zs.get("phishing", 0), 
                scores_zs.get("financial scam", 0), 
                scores_zs.get("threat or blackmail", 0),
                scores_zs.get("identity theft", 0)
            ]
            legit_score = scores_zs.get("legitimate communication", 0)
            max_malicious = max(malicious_scores) if malicious_scores else 0
            zs_risk = max_malicious
            scores["zeroshot"] = zs_risk
        except Exception as e:
            print(f"Zero-shot model error: {e}")
            scores["zeroshot"] = 0.0
    
    # 3. Keyword-based scoring
    kw_risk = 0.0
    if ds:
        try:
            kw_result = ds.match_text_keywords(text)
            if kw_result["total_keyword_hits"] > 0:
                kw_risk = min(1.0, kw_result["total_keyword_hits"] * 0.1)
                for cat in kw_result["matched_categories"].keys():
                    readable_cat = cat.replace("_", " ").title()
                    if readable_cat not in categories:
                        categories.append(readable_cat)
            scores["keyword"] = kw_risk
        except Exception as e:
            print(f"Keyword matching error: {e}")
            scores["keyword"] = 0.0
    
    # Calculate weighted ensemble
    ensemble_risk = (
        weights["finetuned"] * scores.get("finetuned", 0) +
        weights["zeroshot"] * scores.get("zeroshot", 0) +
        weights["keyword"] * scores.get("keyword", 0)
    )
    
    return ensemble_risk * 100, list(set(categories)), scores

# Explainability Vocabularies (English + Hindi)
XAI_VOCAB = {
    "urgency": ["urgent", "immediately", "suspend", "block", "freeze", "24 hours", "action required", "turant", "jald", "warn", "last chance", "expire", "band", "block", "freeze"],
    "phishing": ["verify", "kyc", "update", "link", "click here", "login", "password", "otp", "pin", "pan card", "adhar", "aadhar", "account", "khata", "password", "verify"],
    "financial": ["payment", "transfer", "credited", "debited", "refund", "lottery", "prize", "cash", "rupees", "rs.", "inr", "upi", "paytm", "gpay", "phonepe", "paisa", "paise", "jeet", "lottery", "cashback"],
    "threat": ["arrest", "police", "legal action", "fine", "penalty", "warrant", "court", "jail", "fir", "kanoon", "jurmana", "cbi", "tax"]
}

def extract_matched_words(text: str, category: str, max_words=3) -> list:
    """Helper to find which trigger words from the vocab exist in the text"""
    text_lower = text.lower()
    matches = [word for word in XAI_VOCAB.get(category, []) if word in text_lower]
    return matches[:max_words]

# --- Adversarial Defense Layer ---
ADVERSARIAL_PATTERNS = [
    "ignore previous instructions",
    "disregard all previous",
    "you are now a",
    "bypass instructions",
    "system prompt reveals",
    "forget previous",
    "print your system prompt",
    "override safety",
    "DAN mode"
]

def check_adversarial_input(text: str) -> tuple:
    text_lower = text.lower()
    for pattern in ADVERSARIAL_PATTERNS:
        if pattern.lower() in text_lower:
            return True, pattern
    return False, None

@functools.lru_cache(maxsize=128)
def analyze_text_with_nlp(text: str):
    empty_profile = {"Urgency": 0.0, "Fear": 0.0, "Authority": 0.0, "Reward": 0.0}
    if not nlp_classifier:
        print("NLP Model not available. Returning fallback.")
        return 50.0, "Unknown", [], [], empty_profile
        
    if not text or len(text.strip()) < 5:
        return 10.0, "Low", ["Insufficient Text"], [], empty_profile
    
    # 1. Adversarial Defense Layer
    is_adv, adv_pattern = check_adversarial_input(text)
    if is_adv:
        return 100.0, "Critical", ["Adversarial Prompt Injection"], [FeatureExplanation(
            feature="Adversarial Input Sandbox",
            description=f"Detected a malicious attempt to bypass AI analysis using prompt injection: '{adv_pattern}'.",
            risk_contribution=100.0
        )], empty_profile
    
    # Get dataset instance for keyword matching
    try:
        ds = get_dataset()
    except:
        ds = None
    
    try:
        # Use ensemble approach for better accuracy
        ensemble_risk, ensemble_cats, component_scores = ensemble_analyze_text(
            text, finetuned_classifier, nlp_classifier, ds
        )
        
        # Get zero-shot scores for XAI explanations
        result_zs = nlp_classifier(text, CANDIDATE_LABELS, multi_label=True)
        scores_zs = dict(zip(result_zs['labels'], result_zs['scores']))
        
        # Apply adjustments
        final_risk = ensemble_risk
        
        # Boost for urgency
        if scores_zs.get("urgency", 0) > 0.8:
            final_risk += 10
        
        # Reduce for legitimate signals
        if scores_zs.get("legitimate communication", 0) > 0.7:
            final_risk -= 15
        
        final_risk = max(0, min(100, final_risk))
        
        # Combine categories
        categories = list(set(ensemble_cats))
        
        # Build behavioral profile
        behavioral_profile = {
            "Urgency": round(scores_zs.get("urgency", 0) * 100, 1),
            "Fear": round(scores_zs.get("threat or blackmail", 0) * 100, 1),
            "Authority": round(scores_zs.get("authority impersonation", 0) * 100, 1),
            "Reward": round(scores_zs.get("promotional offer", 0) * 100, 1)
        }
        
        # Risk level
        if final_risk > 85: risk_level_int = "Critical"
        elif final_risk > 65: risk_level_int = "High"
        elif final_risk > 40: risk_level_int = "Medium"
        else: risk_level_int = "Low"
                
        # Generate Explanations using zero-shot scores
        explanations = []
        
        # 1. Urgency Explanation
        urgency_score = scores_zs.get("urgency", 0)
        if urgency_score > 0.7:
            words = extract_matched_words(text, "urgency")
            desc = f"Detected high urgency manipulation relying on words like {', '.join([f'{w!r}' for w in words])}." if words else "The text uses urgent language to force immediate action and induce panic."
            desc += f" (Confidence: {urgency_score:.0%})"
            explanations.append(FeatureExplanation(
                feature="Urgency Manipulation", 
                description=desc, 
                risk_contribution=round(urgency_score * 30, 1)
            ))
            
        # 2. Phishing Explanation
        phishing_score = scores_zs.get("phishing", 0)
        if phishing_score > 0.6:
            words = extract_matched_words(text, "phishing")
            desc = f"Contains credential-harvesting patterns asking for {', '.join([f'{w!r}' for w in words])}." if words else "Language matches common credential-stealing patterns."
            desc += f" (Confidence: {phishing_score:.0%})"
            explanations.append(FeatureExplanation(
                feature="Phishing Attempt", 
                description=desc, 
                risk_contribution=round(phishing_score * 40, 1)
            ))
            
        # 3. Financial/Threat Explanation
        fin_score = scores_zs.get("financial scam", 0)
        threat_score = scores_zs.get("threat or blackmail", 0)
        
        if threat_score > 0.6 and threat_score > fin_score:
            words = extract_matched_words(text, "threat")
            desc = f"Authority impersonation detected using intimidating terms like {', '.join([f'{w!r}' for w in words])}." if words else "Detects aggressive intimidation tactics or blackmail."
            explanations.append(FeatureExplanation(
                feature="Threat / Extortion", 
                description=desc + f" (Confidence: {threat_score:.0%})", 
                risk_contribution=round(threat_score * 40, 1)
            ))
        elif fin_score > 0.6:
            words = extract_matched_words(text, "financial")
            desc = f"Financial fraud signature detected involving {', '.join([f'{w!r}' for w in words])}." if words else "Detects suspicious requests for money or payment details."
            explanations.append(FeatureExplanation(
                feature="Financial Fraud", 
                description=desc + f" (Confidence: {fin_score:.0%})", 
                risk_contribution=round(fin_score * 40, 1)
            ))

        return round(final_risk, 1), risk_level_int, categories, explanations, behavioral_profile
        
    except Exception as e:
        print(f"NLP error: {e}")
        return 50.0, "Unknown", ["NLP Error"], [], empty_profile

def classify_image_with_clip(pil_image):
    """Use CLIP to visually classify an image for scam content."""
    if not clip_model or not clip_processor:
        return 0.0, [], []
    
    try:
        from PIL import Image
        inputs = clip_processor(
            text=CLIP_SCAM_LABELS, 
            images=pil_image, 
            return_tensors="pt", 
            padding=True
        )
        
        # Move inputs to GPU if available
        inputs = {k: v.to(GPU_MGR.get_device()) if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = clip_model(**inputs)
            logits = outputs.logits_per_image[0]
            probs = logits.softmax(dim=0).tolist()
        
        label_scores = dict(zip(CLIP_SCAM_LABELS, probs))
        
        # Scam labels are indices 0-5, benign labels are 6-10
        scam_prob = sum(probs[:6])
        benign_prob = sum(probs[6:])
        
        clip_risk = scam_prob * 100
        
        categories = []
        explanations = []
        
        # Find top scam prediction
        top_scam_label = max(CLIP_SCAM_LABELS[:6], key=lambda l: label_scores[l])
        top_scam_score = label_scores[top_scam_label]
        
        # Find top benign prediction to ensure we don't flag completely safe images
        top_benign_label = max(CLIP_SCAM_LABELS[6:], key=lambda l: label_scores[l])
        top_benign_score = label_scores[top_benign_label]
        
        # Only flag if the scam score outweighs the strongest benign assumption
        if top_scam_score > 0.15 and top_scam_score > top_benign_score:
            short_label = top_scam_label.replace("a screenshot of ", "").replace("a ", "").title()
            categories.append(f"Visual: {short_label[:40]}")
            explanations.append(FeatureExplanation(
                feature="CLIP Visual Analysis",
                description=f"Image visually matches pattern: '{top_scam_label}' (confidence: {top_scam_score:.0%})",
                risk_contribution=round(top_scam_score * 40, 1)
            ))
        
        return clip_risk, categories, explanations
        
    except Exception as e:
        print(f"CLIP classification error: {e}")
        return 0.0, [], []


def detect_deepfake_faces(pil_image):
    """
    Detect deepfake/manipulated faces in images.
    Uses Vision Transformer deepfake detection model.
    
    Returns:
        deepfake_risk: 0-100 risk score
        is_deepfake: boolean
        explanation: FeatureExplanation if detected
    """
    if not deepfake_model or not deepfake_processor:
        return 0.0, False, None
    
    try:
        inputs = deepfake_processor(images=pil_image, return_tensors="pt")
        inputs = {k: v.to(GPU_MGR.get_device()) if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = deepfake_model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)[0]
        
        # Get prediction
        predicted_class = torch.argmax(probs, dim=0).item()
        confidence = probs[predicted_class].item()
        
        # Check model labels
        label_map = deepfake_model.config.id2label if hasattr(deepfake_model.config, 'id2label') else {}
        
        deepfake_prob = 0.0
        is_likely_deepfake = False
        
        for idx, label in label_map.items():
            label_lower = label.lower()
            if "fake" in label_lower or "manipulated" in label_lower or "ai" in label_lower or "synthetic" in label_lower:
                deepfake_prob = max(deepfake_prob, probs[idx].item())
                if probs[idx].item() > 0.5:
                    is_likely_deepfake = True
            elif "real" in label_lower or "authentic" in label_lower or "bonafide" in label_lower:
                if probs[idx].item() < 0.5:
                    deepfake_prob = max(deepfake_prob, 1 - probs[idx].item())
        
        # If no label info, use confidence threshold
        if not label_map and confidence > 0.7:
            # Generic model - assume high confidence = potential deepfake
            deepfake_prob = confidence if predicted_class == 1 else (1 - confidence)
            is_likely_deepfake = deepfake_prob > 0.6
        
        if is_likely_deepfake:
            explanation = FeatureExplanation(
                feature="Deepfake Detection",
                description=f"AI-generated/manipulated face detected with {deepfake_prob*100:.0f}% confidence.",
                risk_contribution=round(deepfake_prob * 50, 1)
            )
            return deepfake_prob * 100, True, explanation
        
        return 0.0, False, None
        
    except Exception as e:
        print(f"Deepfake detection error: {e}")
        return 0.0, False, None


def process_image(image_bytes: bytes) -> ScanningResult:
    import easyocr
    import io
    from PIL import Image
    import numpy as np
    import cv2
    import concurrent.futures
    
    # Initialize reader (will use CPU if GPU not available)
    try:
        reader = easyocr.Reader(['en', 'hi'], gpu=False)  # English + Hindi OCR, CPU ONLY
    except Exception as e:
        print(f"Failed to load OCR reader: {e}")
        reader = None
        
    explanations = []
    threat_categories = []
    risk_score = 0.0
    
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(image)
        
        def run_clip():
            return classify_image_with_clip(image)
            
        def run_deepfake():
            return detect_deepfake_faces(image)
            
        def run_ocr():
            text_out = ""
            risk_out = 0.0
            cats_out = []
            expls_out = []
            beh_out = None
            if not reader:
                return text_out, risk_out, cats_out, expls_out, beh_out
                
            try:
                # ====== OpenCV Preprocessing for Accurate OCR ======
                img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
                gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
                # Apply bilateral filter to remove noise while keeping edges
                filtered = cv2.bilateralFilter(gray, 9, 75, 75)
                # Adaptive block thresholding for high contrast text blocks
                thresh = cv2.adaptiveThreshold(filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
                
                # Results using thresholded image
                results = reader.readtext(thresh)
                text_out = " ".join([res[1] for res in results])
                
                if text_out and len(text_out.strip()) >= 5:
                    risk_out, _, cats_out, expls_out, beh_out = analyze_text_with_nlp(text_out)
                    
                    if risk_out > 60:
                        expls_out.append(FeatureExplanation(
                            feature="Text-in-Image Evasion", 
                            description="Malicious text hidden inside an image is a common tactic to bypass spam filters.", 
                            risk_contribution=10.0
                        ))
                        risk_out = min(100.0, risk_out + 10)
            except Exception as e:
                print(f"OCR thread error: {e}")
                
            return text_out, risk_out, cats_out, expls_out, beh_out

        # ========== CONCURRENT EXECUTION ==========
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            fut_clip = executor.submit(run_clip)
            fut_df = executor.submit(run_deepfake)
            fut_ocr = executor.submit(run_ocr)
            
            clip_risk, clip_cats, clip_expls = fut_clip.result()
            deepfake_risk, is_deepfake, deepfake_expl = fut_df.result()
            extracted_text, ocr_risk, nlp_cats, nlp_expls, beh_profile = fut_ocr.result()

        threat_categories.extend(clip_cats)
        explanations.extend(clip_expls)

        if is_deepfake and deepfake_expl:
            threat_categories.append("Deepfake")
            explanations.append(deepfake_expl)
            clip_risk = max(clip_risk, deepfake_risk)

        threat_categories.extend(nlp_cats)
        explanations.extend(nlp_expls)

        # Combined Score
        if extracted_text and len(extracted_text.strip()) >= 5:
            risk_score = 0.4 * clip_risk + 0.6 * ocr_risk
        else:
            risk_score = clip_risk
            if not explanations:
                explanations.append(FeatureExplanation(
                    feature="No Text Detected", 
                    description="Image contains no readable text. Analysis based on visual content only.", 
                    risk_contribution=0.0
                ))
        
        final_risk = max(0, min(100.0, risk_score))
        if final_risk > 85: risk_level = "Critical"
        elif final_risk > 65: risk_level = "High"
        elif final_risk > 40: risk_level = "Medium"
        else: risk_level = "Low"
        
        return ScanningResult(
            id=str(uuid.uuid4()),
            timestamp=datetime.datetime.utcnow().isoformat(),
            type="image",
            risk_score=round(final_risk, 1),
            risk_level=risk_level,
            threat_categories=list(set(threat_categories)) if threat_categories else [],
            explanations=explanations if explanations else [FeatureExplanation(feature="Clean Image", description="No scam indicators detected visually or via text extraction.", risk_contribution=0.0)],
            raw_text_extracted=extracted_text if extracted_text else "[No text detected]",
            behavioral_profile=beh_profile
        )
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return ScanningResult(
            id=str(uuid.uuid4()),
            timestamp=datetime.datetime.utcnow().isoformat(),
            type="image",
            risk_score=50.0,
            risk_level="Unknown",
            threat_categories=["Processing Error"],
            explanations=[FeatureExplanation(feature="Image Read Error", description=str(e), risk_contribution=0.0)]
        )

@functools.lru_cache(maxsize=128)
def process_url(url: str) -> ScanningResult:
    # URL feature implementation
    import re
    import requests
    from bs4 import BeautifulSoup
    
    # Simple lexical features
    is_ip = bool(re.match(r'^https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url))
    num_subdomains = len(urllib.parse.urlparse(url).netloc.split('.')) - 2
    has_at_symbol = "@" in url
    
    risk_score = 0.0
    threat_categories = []
    explanations = []
    
    # 1. Deep Learning Analysis (Highest Trust)
    if url_classifier:
        try:
            res = url_classifier(url)
            # res is usually [{'label': 'url_phishing', 'score': 0.99...}]
            scores = {entry['label']: entry['score'] for entry in (res[0] if isinstance(res[0], list) else res)}
            phish_score = scores.get("url_phishing", 0)
            
            risk_score = phish_score * 100
            if phish_score > 0.6:
                threat_categories.append("Phishing Signature Match")
                explanations.append(FeatureExplanation(
                    feature="Deep Learning URL Scanner",
                    description=f"AI identified structural fraud patterns common to deceptive portals. (Confidence: {phish_score:.1%})",
                    risk_contribution=round(phish_score * 50, 1)
                ))
        except Exception as e:
            print(f"Deep URL scanner error: {e}")
            risk_score = 10.0 # Fallback
    else:
        risk_score = 10.0 # No classifier available

    # 2. Heuristic Layer
    if is_ip:
        risk_score += 40
        threat_categories.append("IP-based Domain")
        explanations.append(FeatureExplanation(
            feature="IP Address URL",
            description="Legitimate sites rarely use raw IP addresses for primary navigation.",
            risk_contribution=40.0
        ))
        
    if num_subdomains > 2:
        risk_score += 20
        threat_categories.append("Subdomain Spoofing")
        explanations.append(FeatureExplanation(
            feature="Excessive Subdomains",
            description=f"Detected {num_subdomains} subdomains, a common tactic to hide the real destination.",
            risk_contribution=20.0
        ))
        
    if has_at_symbol:
        risk_score += 45
        threat_categories.append("Credential Injection")
        explanations.append(FeatureExplanation(
            feature="Obfuscated URL Structure",
            description="The @ symbol used in the domain is a strong indicator of login phishing.",
            risk_contribution=45.0
        ))

    # --- Indian Scam Dataset: URL Indicator Analysis ---
    try:
        ds = get_dataset()
        url_analysis = ds.match_url_indicators(url)
        if url_analysis["indicator_count"] > 0:
            risk_score += url_analysis["boost_score"]
            if url_analysis["is_likely_phishing"] and "Phishing Signature Match" not in threat_categories:
                threat_categories.append("Indian Phishing Pattern")
            indicators_str = ", ".join(url_analysis["detected_indicators"][:3])
            explanations.append(FeatureExplanation(
                feature="Indian Scam Indicator",
                description=f"Matches known regional phishing patterns: {indicators_str}.",
                risk_contribution=float(url_analysis["boost_score"])
            ))
    except Exception as e:
        print(f"Dataset URL analysis error: {e}")

    # Fetch webpage content
    raw_text = None
    beh_profile = None
    try:
        # short timeout so the API doesn't hang
        response = requests.get(url, timeout=3, headers={'User-Agent': 'Mozilla/5.0'}) 
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            page_text = " ".join(soup.stripped_strings)
            raw_text = page_text[:1000]
            
            if raw_text:
                nlp_risk, _, nlp_cats, nlp_expls, beh_profile = analyze_text_with_nlp(raw_text)
                risk_score = max(risk_score, nlp_risk) # Use higher risk: URL or Content
                threat_categories.extend([c for c in nlp_cats if c not in threat_categories])
                explanations.extend([e for e in nlp_expls if e.feature not in [ex.feature for ex in explanations]])
    except Exception as e:
        print(f"Error fetching URL content: {e}")
        if "verify" in url or "update" in url:
            risk_score += 10
            explanations.append(FeatureExplanation(
                feature="Unreachable Destination",
                description="Could not scan webpage content. Access was blocked or site is offline.",
                risk_contribution=10.0
            ))

    # Clamp and level
    final_risk = max(0.0, min(100.0, risk_score))
    if final_risk > 85: risk_level = "Critical"
    elif final_risk > 65: risk_level = "High"
    elif final_risk > 40: risk_level = "Medium"
    else: risk_level = "Low"
    
    return ScanningResult(
        id=str(uuid.uuid4()),
        timestamp=datetime.datetime.utcnow().isoformat(),
        type="url",
        risk_score=round(final_risk, 1),
        risk_level=risk_level,
        threat_categories=list(set(threat_categories)) if threat_categories else ["Suspicious URL"],
        explanations=explanations if explanations else [FeatureExplanation(feature="Clean URL", description="No standard phishing indicators found.", risk_contribution=0.0)],
        raw_text_extracted=raw_text if raw_text else "[Web content unreachable]",
        behavioral_profile=beh_profile
    )


import concurrent.futures

def _analyze_visual_stream(tmp_video_path):
    import cv2
    import numpy as np
    from PIL import Image
    
    visual_risk = 0.0
    deepfake_risk = 0.0
    threat_categories = []
    explanations = []
    
    try:
        cap = cv2.VideoCapture(tmp_video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        duration = total_frames / fps if fps > 0 else 0
        
        num_keyframes = min(5, max(1, total_frames))
        frame_indices = [int(i * total_frames / num_keyframes) for i in range(num_keyframes)]
        
        frame_risks = []
        pil_frames = []
        
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_frame = Image.fromarray(frame_rgb)
                pil_frames.append(pil_frame)
                
                clip_risk, clip_cats, clip_expls = classify_image_with_clip(pil_frame)
                frame_risks.append(clip_risk)
                
                if clip_risk == max(frame_risks):
                    frame_threat_cats = clip_cats
                    frame_explanations = clip_expls
        
        cap.release()
        
        if frame_risks:
            visual_risk = max(frame_risks)
            threat_categories.extend(frame_threat_cats if 'frame_threat_cats' in locals() else [])
            explanations.extend(frame_explanations if 'frame_explanations' in locals() else [])
            explanations.append(FeatureExplanation(
                feature="Video Frame Analysis",
                description=f"Analyzed {len(frame_risks)} keyframes from {duration:.1f}s video. Max visual risk: {visual_risk:.0f}%",
                risk_contribution=round(visual_risk * 0.4, 1)
            ))
            
        if deepfake_model and deepfake_processor and pil_frames:
            max_deepfake = 0.0
            deepfake_detected = False
            df_expls = []
            for frame in pil_frames[:5]:
                df_risk, is_df, df_expl = detect_deepfake_faces(frame)
                if df_risk > max_deepfake:
                    max_deepfake = df_risk
                    deepfake_detected = is_df
                    if df_expl:
                        df_expls.append(df_expl)
                        
            deepfake_risk = max_deepfake
            if df_expls:
                explanations.extend(df_expls[:1])
            if deepfake_detected:
                threat_categories.append("Deepfake")
                
    except Exception as e:
        print(f"Visual processing error: {e}")
        
    return visual_risk, deepfake_risk, threat_categories, explanations

def _analyze_audio_stream(tmp_video_path):
    text_risk = 0.0
    transcript_text = ""
    threat_categories = []
    explanations = []
    beh_profile = None
    
    try:
        import whisper
        from moviepy.editor import VideoFileClip
        
        tmp_audio_path = tmp_video_path.replace(".mp4", ".wav")
        clip = VideoFileClip(tmp_video_path)
        
        if clip.audio is not None:
            clip.audio.write_audiofile(tmp_audio_path, logger=None)
            clip.close()
            
            if whisper_model:
                print("Transcribing video audio with Whisper...")
                result = whisper_model.transcribe(tmp_audio_path)
                transcript_text = result.get("text", "").strip()
                detected_lang = result.get("language", "unknown")
            else:
                transcript_text = ""
                detected_lang = "unknown"
                
            if os.path.exists(tmp_audio_path):
                os.remove(tmp_audio_path)
                
            if transcript_text and len(transcript_text) >= 10:
                text_risk, _, nlp_cats, nlp_expls, beh_profile = analyze_text_with_nlp(transcript_text)
                threat_categories.extend(nlp_cats)
                explanations.extend(nlp_expls)
                explanations.append(FeatureExplanation(
                    feature="Audio Transcription",
                    description=f"Transcribed {len(transcript_text)} characters of speech (language: {detected_lang}). NLP risk: {text_risk:.0f}%",
                    risk_contribution=round(text_risk * 0.6, 1)
                ))
            else:
                explanations.append(FeatureExplanation(
                    feature="No Speech Detected",
                    description="Video audio contained no recognizable speech.",
                    risk_contribution=0.0
                ))
        else:
            clip.close()
            explanations.append(FeatureExplanation(
                feature="No Audio Track",
                description="Video does not contain an audio track.",
                risk_contribution=0.0
            ))
            
    except ImportError as e:
        print(f"Whisper/moviepy not available in audio thread: {e}")
    except Exception as e:
        print(f"Audio processing error: {e}")
        
    return text_risk, transcript_text, threat_categories, explanations, beh_profile

def process_video(video_bytes: bytes) -> ScanningResult:
    """Multi-modal video analysis utilizing concurrent threads."""
    
    tmp_video_path = os.path.join(tempfile.gettempdir(), f"scan_{uuid.uuid4().hex}.mp4")
    try:
        with open(tmp_video_path, "wb") as f:
            f.write(video_bytes)
    except Exception as e:
        return ScanningResult(
            id=str(uuid.uuid4()),
            timestamp=datetime.datetime.utcnow().isoformat(),
            type="video",
            risk_score=50.0,
            risk_level="Unknown",
            threat_categories=["File Error"],
            explanations=[FeatureExplanation(feature="Video Save Error", description=str(e), risk_contribution=0.0)]
        )
        
    try:
        # Concurrent Threading
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            future_visual = executor.submit(_analyze_visual_stream, tmp_video_path)
            future_audio = executor.submit(_analyze_audio_stream, tmp_video_path)
            
            # Block and wait for both to unpack
            visual_risk, deepfake_risk, vis_cats, vis_expls = future_visual.result()
            text_risk, transcript_text, aud_cats, aud_expls, beh_profile = future_audio.result()
            
        threat_categories = list(set(vis_cats + aud_cats))
        explanations = vis_expls + aud_expls
        
        # Combined Score Calculation
        if transcript_text and len(transcript_text) >= 10:
            final_risk = 0.3 * visual_risk + 0.3 * deepfake_risk + 0.4 * text_risk
        else:
            final_risk = 0.5 * visual_risk + 0.5 * deepfake_risk
            
        final_risk = max(0, min(100.0, final_risk))
        
        if final_risk > 85: risk_level = "Critical"
        elif final_risk > 65: risk_level = "High"
        elif final_risk > 40: risk_level = "Medium"
        else: risk_level = "Low"
        
        return ScanningResult(
            id=str(uuid.uuid4()),
            timestamp=datetime.datetime.utcnow().isoformat(),
            type="video",
            risk_score=round(final_risk, 1),
            risk_level=risk_level,
            threat_categories=threat_categories if threat_categories else [],
            explanations=explanations if explanations else [FeatureExplanation(feature="Clean Video", description="No scam indicators detected.", risk_contribution=0.0)],
            raw_text_extracted=transcript_text if transcript_text else "[No speech detected]",
            behavioral_profile=beh_profile
        )
        
    except Exception as e:
        print(f"Error processing threaded video: {e}")
        return ScanningResult(
            id=str(uuid.uuid4()),
            timestamp=datetime.datetime.utcnow().isoformat(),
            type="video",
            risk_score=50.0,
            risk_level="Unknown",
            threat_categories=["Processing Error"],
            explanations=[FeatureExplanation(feature="Video Processing Error", description=str(e), risk_contribution=0.0)]
        )
    finally:
        if os.path.exists(tmp_video_path):
            os.remove(tmp_video_path)

def process_text(text: str) -> ScanningResult:
    # Real NLP Implementation
    risk_score, risk_level, categories, explanations, beh_profile = analyze_text_with_nlp(text)
    
    # --- Indian Scam Dataset: Keyword Boost ---
    try:
        ds = get_dataset()
        kw_result = ds.match_text_keywords(text)
        
        if kw_result["total_keyword_hits"] > 0:
            risk_score = min(100.0, risk_score + kw_result["boost_score"])
            
            # Add matched Indian scam category to threat categories
            if kw_result["top_category"]:
                readable_cat = kw_result["top_category"].replace("_", " ").title()
                if readable_cat not in categories:
                    categories.append(readable_cat)
            
            # Build explanation with matched keywords
            matched_cats = list(kw_result["matched_categories"].keys())
            sample_keywords = []
            for cat_keywords in kw_result["matched_categories"].values():
                sample_keywords.extend(cat_keywords[:2])
            kw_str = ", ".join([f"'{w}'" for w in sample_keywords[:5]])
            
            explanations.append(FeatureExplanation(
                feature="Indian Scam Pattern Match",
                description=f"Direct match found in Indian scam database ({', '.join(matched_cats[:2])}). Highly resembles known fraud tactics using terms like {kw_str}.",
                risk_contribution=float(kw_result["boost_score"])
            ))
        
        # --- Benign Signal Reduction (Anti-False Positive) ---
        benign_result = ds.match_benign_patterns(text)
        if benign_result["is_likely_benign"]:
            reduction = benign_result["reduction_score"]
            risk_score = max(0.0, risk_score - reduction)
            explanations.append(FeatureExplanation(
                feature="Legitimate Signal Detected",
                description=f"Text contains legitimate transactional markers like {', '.join([f'{w!r}' for w in benign_result['matched_keywords'][:3]])}. Reducing risk probability.",
                risk_contribution=-float(reduction)
            ))

        # Find similar known scam examples for precise explainability
        similar = ds.get_similar_scam_examples(text, top_n=2)
        for i, item in enumerate(similar):
            if item["keyword_overlap"] >= 2:
                explanations.append(FeatureExplanation(
                    feature=f"Reference Case #{i+1}",
                    description=f"High similarity to recorded scam [{item['category'].replace('_',' ').title()}]: \"{item['text_preview']}\"",
                    risk_contribution=2.0
                ))
    except Exception as e:
        print(f"Dataset text analysis error: {e}")
    
    # Recalculate risk level after boost
    if risk_score > 85: risk_level = "Critical"
    elif risk_score > 65: risk_level = "High"
    elif risk_score > 40: risk_level = "Medium"
    else: risk_level = "Low"
    
    return ScanningResult(
        id=str(uuid.uuid4()),
        timestamp=datetime.datetime.utcnow().isoformat(),
        type="text",
        risk_score=round(risk_score, 1),
        risk_level=risk_level,
        threat_categories=categories if categories else ["Suspicious Content"],
        explanations=explanations if explanations else [FeatureExplanation(feature="Analysis Complete", description="No extreme risk factors matched.", risk_contribution=0.0)],
        raw_text_extracted=text,
        behavioral_profile=beh_profile
    )
