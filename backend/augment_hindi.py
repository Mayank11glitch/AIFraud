"""
Hindi/Hinglish Data Augmentation for Scam Detection

This script augments the training dataset with Hindi and Hinglish
(Code-mixed Hindi-English) scam samples to improve multilingual accuracy.
"""

import pandas as pd
import random
import os

HINDI_SCAM_TEMPLATES = {
    "phishing": [
        "आपका KYC अपडेट करें अन्यथा अकाउंट बंद हो जाएगा। लिंक पर क्लिक करें: {link}",
        "अपना पासवर्ड वेरीफाई करें। आपका OTP है: {otp}",
        "आपका अकाउंट सस्पेंड हो गया है। तुरंत लॉगिन करें: {link}",
        "Aadhaar verification required. Click here: {link}",
        "अपना PAN कार्ड अपडेट करें नहीं तो फाइन होगा।",
    ],
    "upi_fraud": [
        "आपने Rs. {amount} जीते हैं! क्लेम करने के लिए UPI ऐप में जाएं।",
        "Your UPI ID verification pending. Complete here: {link}",
        "Rs. {amount} credited to your account. Confirm within 24 hours.",
        "Paytm से पैसा मिलेगा। बस अपना नंबर शेयर करें: {number}",
        "KYC complete hone ke liye Rs. {amount} bhejo.",
    ],
    "investment_scam": [
        "Invest in our plan and get double returns in 7 days! WhatsApp: {number}",
        "Free stock tips! Invest Rs. {amount} and get Rs. {triple_amount} in 1 week.",
        "डबल रिटर्न के लिए इन्वेस्ट करें। बस Rs. {amount} से शुरू करें।",
        "100% guaranteed returns on investment. Join now: {number}",
        "Stock market se paisa kamayein. Contact: {number}",
    ],
    "benign": [
        "Your account balance is Rs. {amount}. Last transaction: UPI payment of Rs. {amount2}.",
        "Movie ticket booked for tomorrow at 7pm. Enjoy!",
        "Your electricity bill payment successful. Amount: Rs. {amount}.",
        "Flipkart order delivered. Thank you for shopping with us.",
        "Happy birthday! Wishing you a great year ahead.",
    ]
}

HINGLISH_SCAM_TEMPLATES = {
    "phishing": [
        "Bhai, apna OTP bhejo na, account verify karna hai. OTP: {otp}",
        "Sir, your Amazon order is pending. Pay now: {link}",
        "Bank se call aaya, password batana padega. Kabhi nahi bola?",
        "Click here for free recharge: {link}",
        "WhatsApp account blocked. Verify with OTP: {otp}",
    ],
    "upi_fraud": [
        "Bro, Rs. {amount} transfer kar diya, confirm karo na!",
        "Aapka UPI payment stuck hai. Re-verify karein: {link}",
        "Free recharge paane ke liye ye link open karo: {link}",
        "Rs. 5000 jeetaya lottery mein! Abhi claim karo: {number}",
        "Bhai, GPay se money bhejo, double milega!",
    ],
    "investment_scam": [
        "Boss, invest 1000 and get 3000 in 2 days. WhatsApp: {number}",
        "Trading mein paisa double karein. Join fast: {number}",
        "Guaranteed returns! Bas Rs. {amount} invest karein.",
        "Crypto se ameer bano. Contact: {number}",
        "Paisa double karne ka chance hai, mat miss karo!",
    ],
    "benign": [
        "Dinner plans tonight at 8pm. Pizza or Chinese?",
        "Movie chalenge weekend pe? Kon sa film dekhein?",
        "Bhai, shopping ke liye mall jana hai, chaloge?",
        "Flight ticket booked for Delhi. See you soon!",
        "New job mil gaya! Party denge next week.",
    ]
}


def generate_augmented_samples(num_samples=5000, balance_ratio=0.3):
    """
    Generate Hindi/Hinglish scam samples for data augmentation.
    
    Args:
        num_samples: Number of samples to generate
        balance_ratio: Ratio of benign samples (to reduce false positives)
    """
    samples = []
    
    # Generate Hindi samples
    for category, templates in HINDI_SCAM_TEMPLATES.items():
        count = num_samples // 4
        for _ in range(count):
            template = random.choice(templates)
            amt = random.choice([500, 1000, 2000, 5000, 10000])
            text = template.format(
                link="hxxps://fake-site.com/verify",
                otp="123456",
                amount=amt,
                triple_amount=amt * 3,
                number="9876543210",
                amount2=amt + 100
            )
            samples.append({
                "text": text,
                "category": category
            })
    
    # Generate Hinglish samples
    for category, templates in HINGLISH_SCAM_TEMPLATES.items():
        count = num_samples // 4
        for _ in range(count):
            template = random.choice(templates)
            amt = random.choice([500, 1000, 2000, 5000, 10000])
            text = template.format(
                link="hxxps://fake-site.com/verify",
                otp="123456",
                amount=amt,
                number="9876543210"
            )
            samples.append({
                "text": text,
                "category": category
            })
    
    # Shuffle
    random.shuffle(samples)
    
    return pd.DataFrame(samples)


def augment_dataset(input_path, output_path, num_samples=5000):
    """
    Augment existing dataset with Hindi/Hinglish samples.
    
    Args:
        input_path: Path to original text_dataset.csv
        output_path: Path to save augmented dataset
        num_samples: Number of new samples to add
    """
    # Load original dataset
    original_df = pd.read_csv(input_path)
    print(f"Original dataset: {len(original_df)} samples")
    print(f"Original distribution:\n{original_df['category'].value_counts()}")
    
    # Generate augmented data
    aug_df = generate_augmented_samples(num_samples)
    print(f"\nGenerated {len(aug_df)} Hindi/Hinglish samples")
    print(f"Augmented distribution:\n{aug_df['category'].value_counts()}")
    
    # Combine datasets
    combined_df = pd.concat([original_df, aug_df], ignore_index=True)
    print(f"\nCombined dataset: {len(combined_df)} samples")
    print(f"Combined distribution:\n{combined_df['category'].value_counts()}")
    
    # Save
    combined_df.to_csv(output_path, index=False)
    print(f"\nSaved augmented dataset to: {output_path}")
    
    return combined_df


def create_hindi_test_set(num_samples=500):
    """Create a separate Hindi/Hinglish test set for evaluation."""
    samples = []
    
    # Generate test samples (different from training templates)
    test_templates = {
        "phishing": [
            "SBI bank se message aaya. Account verify karne ke liye link click karein.",
            "Government portal se aaya hai. KYC update karein immediately.",
            "Netflix subscription expire ho raha hai. Renew now: {link}",
        ],
        "upi_fraud": [
            "Amazon se prize money milna baaki hai. Verify UPI ID.",
            "PhonePe cashback claim karein. Open link: {link}",
            "UPI payment failed. Re-enter details: {link}",
        ],
        "investment_scam": [
            "Mutual fund mein invest karein aur double profit paayein.",
            "Gold investment scheme mein joining karne ke liye call karein.",
            "Bitcoin investment se paisa double. Contact now.",
        ],
        "benign": [
            "Aaj kal office late tak hai. Dinner ke liye late aaunga.",
            "Metro train ka ticket book kar liya. 7 baje station pe milte hain.",
            "Salary credited to your account. Check bank app.",
        ]
    }
    
    for category, templates in test_templates.items():
        for _ in range(num_samples // 4):
            template = random.choice(templates)
            text = template.format(link="hxxps://test.com", number="9999999999")
            samples.append({"text": text, "category": category})
    
    test_df = pd.DataFrame(samples)
    test_path = os.path.join("dataset", "data", "hindi_test.csv")
    test_df.to_csv(test_path, index=False)
    print(f"Hindi test set saved to: {test_path}")
    
    return test_df


if __name__ == "__main__":
    # Generate augmented dataset
    input_path = os.path.join("dataset", "data", "text_dataset.csv")
    output_path = os.path.join("dataset", "data", "text_dataset_augmented.csv")
    
    augmented_df = augment_dataset(input_path, output_path, num_samples=5000)
    
    # Create test set
    create_hindi_test_set(500)