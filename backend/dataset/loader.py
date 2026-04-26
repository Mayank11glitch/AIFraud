"""
Indian Multi-Modal Scam Dataset Loader

Loads the curated dataset of India-specific scam patterns and provides
keyword matching, pattern detection, and similarity scoring utilities
for integration with the main scam detection pipeline.
"""

import json
import os
import re
from typing import List, Dict, Optional

DATASET_DIR = os.path.join(os.path.dirname(__file__), "samples")


class IndianScamDataset:
    """Loads and queries the Indian multi-modal scam dataset."""
    
    def __init__(self):
        self.text_scams: List[Dict] = []
        self.url_scams: List[Dict] = []
        self.benign_samples: List[Dict] = []
        self.scam_keywords: Dict[str, List[str]] = {}  # category -> keywords
        self.benign_keywords: List[str] = []
        self.url_indicators: Dict[str, List[str]] = {}  # indicator -> urls
        self._load_all()
    
    def _load_json(self, filename: str) -> List[Dict]:
        filepath = os.path.join(DATASET_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def _load_all(self):
        """Load all dataset files and build lookup indexes."""
        self.text_scams = self._load_json("text_scams.json")
        self.url_scams = self._load_json("url_scams.json")
        self.benign_samples = self._load_json("benign_samples.json")
        
        # Build keyword index by category
        for sample in self.text_scams:
            cat = sample.get("category", "unknown")
            if cat not in self.scam_keywords:
                self.scam_keywords[cat] = []
            for kw in sample.get("keywords", []):
                if kw.lower() not in [k.lower() for k in self.scam_keywords[cat]]:
                    self.scam_keywords[cat].append(kw)
        
        # Build benign keyword index
        for sample in self.benign_samples:
            for kw in sample.get("keywords", []):
                if kw.lower() not in [k.lower() for k in self.benign_keywords]:
                    self.benign_keywords.append(kw)
        
        # Build URL indicator index
        for sample in self.url_scams:
            for ind in sample.get("indicators", []):
                if ind not in self.url_indicators:
                    self.url_indicators[ind] = []
                self.url_indicators[ind].append(sample.get("url", ""))
    
    def get_all_scam_keywords(self) -> List[str]:
        """Return a flat list of all unique scam keywords."""
        all_kw = set()
        for keywords in self.scam_keywords.values():
            for kw in keywords:
                all_kw.add(kw.lower())
        return list(all_kw)
    
    def match_text_keywords(self, text: str) -> Dict:
        """
        Match input text against the dataset's keyword patterns.
        Returns matched categories, keyword hits, and a boost score.
        """
        text_lower = text.lower()
        matches = {}
        total_hits = 0
        
        for category, keywords in self.scam_keywords.items():
            hits = []
            for kw in keywords:
                if kw.lower() in text_lower:
                    hits.append(kw)
            if hits:
                matches[category] = hits
                total_hits += len(hits)
        
        # Calculate a boost score (0-30) based on keyword density
        boost = min(30, total_hits * 5)
        
        return {
            "matched_categories": matches,
            "total_keyword_hits": total_hits,
            "boost_score": boost,
            "top_category": max(matches, key=lambda c: len(matches[c])) if matches else None
        }
    
    def match_benign_patterns(self, text: str) -> Dict:
        """
        Match text against known benign/safe patterns (e.g. real bank SMS).
        Returns matched keywords and a reduction score.
        """
        text_lower = text.lower()
        hits = [kw for kw in self.benign_keywords if kw.lower() in text_lower]
        
        # Reduce risk score if strongly matching benign patterns
        reduction = min(40, len(hits) * 10)
        
        return {
            "matched_keywords": hits,
            "is_likely_benign": len(hits) >= 2,
            "reduction_score": reduction
        }
    
    def match_url_indicators(self, url: str) -> Dict:
        """
        Analyze a URL against known Indian phishing indicators.
        Returns detected indicators and a risk boost score.
        """
        url_lower = url.lower()
        detected = []
        
        # Check for IP-based domain
        if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url_lower):
            detected.append("ip_address_domain")
        
        # Check for suspicious TLDs
        suspicious_tlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top']
        for tld in suspicious_tlds:
            if tld in url_lower:
                detected.append("suspicious_tld")
                break
        
        # Check for Indian bank/service impersonation
        indian_brands = ['sbi', 'hdfc', 'icici', 'axis', 'paytm', 'phonepe', 'gpay',
                         'upi', 'npci', 'irctc', 'aadhaar', 'uidai', 'epfo', 'gst',
                         'incometax', 'flipkart', 'jio', 'airtel']
        for brand in indian_brands:
            if brand in url_lower and not any(legit in url_lower for legit in 
                [f'{brand}.co.in', f'{brand}.com', f'{brand}.org.in', f'{brand}.gov.in']):
                detected.append(f"{brand}_impersonation")
        
        # Check for subdomain spoofing (e.g., sbi.co.in.phishingsite.com)
        if re.search(r'\.gov\.in\.[a-z]+\.', url_lower) or re.search(r'\.co\.in\.[a-z]+\.', url_lower):
            detected.append("subdomain_spoofing")
        
        # Check for free hosting
        free_hosts = ['herokuapp', 'netlify', 'vercel', 'blogspot', 'wordpress.com',
                      'wixsite', 'weebly', 'github.io']
        for host in free_hosts:
            if host in url_lower:
                detected.append("free_hosting")
                break
        
        # Check for scam keywords in URL path
        scam_url_keywords = ['verify', 'claim', 'refund', 'cashback', 'winner', 'kyc',
                             'update', 'reactivate', 'login', 'otp', 'reward']
        for kw in scam_url_keywords:
            if kw in url_lower:
                detected.append(f"url_keyword_{kw}")
        
        boost = min(40, len(detected) * 8)
        
        return {
            "detected_indicators": detected,
            "indicator_count": len(detected),
            "boost_score": boost,
            "is_likely_phishing": len(detected) >= 2
        }
    
    def get_similar_scam_examples(self, text: str, top_n: int = 3) -> List[Dict]:
        """
        Find the most similar scam examples from the dataset by keyword overlap.
        Useful for explainability — showing users similar known scam patterns.
        """
        text_lower = text.lower()
        scored = []
        
        for sample in self.text_scams:
            keywords = sample.get("keywords", [])
            overlap = sum(1 for kw in keywords if kw.lower() in text_lower)
            if overlap > 0:
                scored.append({
                    "id": sample["id"],
                    "category": sample["category"],
                    "text_preview": sample["text"][:100] + "...",
                    "keyword_overlap": overlap,
                    "reference_risk_score": sample["risk_score"]
                })
        
        scored.sort(key=lambda x: x["keyword_overlap"], reverse=True)
        return scored[:top_n]
    
    def get_dataset_stats(self) -> Dict:
        """Return summary statistics of the dataset."""
        categories = {}
        for sample in self.text_scams:
            cat = sample.get("category", "unknown")
            categories[cat] = categories.get(cat, 0) + 1
        
        return {
            "total_text_scams": len(self.text_scams),
            "total_url_scams": len(self.url_scams),
            "total_benign": len(self.benign_samples),
            "total_samples": len(self.text_scams) + len(self.url_scams) + len(self.benign_samples),
            "categories": categories,
            "total_unique_keywords": len(self.get_all_scam_keywords()),
            "url_indicator_types": len(self.url_indicators)
        }


# Singleton instance
_dataset_instance: Optional[IndianScamDataset] = None

def get_dataset() -> IndianScamDataset:
    """Get or create the singleton dataset instance."""
    global _dataset_instance
    if _dataset_instance is None:
        _dataset_instance = IndianScamDataset()
    return _dataset_instance
