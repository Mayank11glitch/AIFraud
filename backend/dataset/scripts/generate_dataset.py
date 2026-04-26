import csv
import random
import os

# Define output paths
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

TEXT_DATASET_PATH = os.path.join(DATA_DIR, "text_dataset.csv")
URL_DATASET_PATH = os.path.join(DATA_DIR, "url_dataset.csv")

# ==========================================
# 1. TEXT DATASET GENERATOR (~30,000 samples)
# ==========================================

def generate_text_dataset(num_samples=30000):
    print(f"Generating {num_samples} text samples...")
    
    # Target distribution based on user requirements:
    # Total: ~27k-30k. Let's do 30k total.
    # Phishing: 9000
    # UPI scams: 6000
    # Investment scams: 4000
    # Normal messages: 11000
    
    targets = {
        "phishing": int(num_samples * 0.30),
        "upi_fraud": int(num_samples * 0.20),
        "investment_scam": int(num_samples * 0.13),
        "benign": int(num_samples * 0.37)
    }
    
    # Phishing Templates
    phishing_templates = [
        "URGENT: Your {bank} account KYC has expired. Update immediately at {url} to avoid suspension.",
        "Dear customer, your PAN card is not linked to your {bank} account. Link now: {url}",
        "Your {bank} internet banking access will be locked in 24 hrs. Verify your identity at {url}",
        "Income Tax Notice: You have a pending refund of Rs.{amount}. Claim it here: {url}",
        "{brand} Winner! You have been selected for a free gift worth Rs.{amount}. Claim: {url}",
        "Your {service} account has been logged in from an unknown device. If this wasn't you, secure your account: {url}",
        "Dear Policyholder, your LIC premium is due. Pay Rs.{amount} online using {url} and get 10% cashback.",
        "Your Netflix subscription has expired. Renew immediately at {url} to continue watching.",
        "Action Required: Complete your {bank} Aadhaar linking process today via {url}",
        "Dear {bank} customer, 15,000 reward points are expiring today. Redeem for cash at {url}"
    ]
    
    # UPI Fraud Templates
    upi_templates = [
        "ALERT: Rs.{amount} debited from your A/c. If not done by you, forward this SMS to {number} to block transaction.",
        "You have received a payment of Rs.{amount} on PhonePe. Enter your UPI pin to claim the amount.",
        "Congratulations! You won Rs.{amount} cashback on Google Pay. Click here and enter PIN to receive: {url}",
        "Dear Sir/Madam, your UPI transaction of Rs.{amount} failed. Scan the QR code sent on your WhatsApp to process refund.",
        "Your electricity bill of Rs.{amount} is pending. Power will be disconnected at 9 PM. Pay via UPI: {upi_id}",
        "Customer Service: Please share the 6-digit OTP to process your refund of Rs.{amount} via UPI.",
        "Your Paytm KYC details are incomplete. Your wallet will be blocked. Call {number} to update.",
        "Aapke UPI par Rs.{amount} bhej diye gaye hain. Confirm karne ke liye apna PIN dalein.",
        "Dear Customer, your FASTag wallet is almost empty. Recharge now via UPI {upi_id} to avoid double toll.",
        "Reliance Jio: Your number has been selected for 1-year free recharge. Pay Rs.10 activation fee via UPI: {upi_id}"
    ]
    
    # Investment Templates
    invest_templates = [
        "Earn Guaranteed 30% monthly returns! Invest Rs.{amount} in crypto now. Join Telegram: {url}",
        "Work from home opportunity! Earn Rs.5000 daily by liking YouTube videos. Deposit Rs.{small_amount} security fee.",
        "IPO Alert: Apply for Pre-IPO shares of {brand}. 500% returns expected in 3 months. Register: {url}",
        "Multibagger Stock Tip: Buy 'XYZ Infra' target 500 (Current 40). Insider info! Subscribe to our premium channel Rs.{amount}.",
        "Make Rs.50,000 per month with simple data entry. Zero investment plan requires Rs.{small_amount} registration. {url}",
        "RBI Approved SIP: Invest Rs.1000/month and get 1 Crore in 5 years. Start your journey today: {url}",
        "You have been chosen for an exclusive Forex trading group. Deposit Rs.{amount} and our AI will trade for you. {url}",
        "Double your money in 100 days! Authentic scheme registered with Government. Start investing: {url}",
        "Part-time job offer from Amazon. Earn up to Rs.3000/day. Message HR on WhatsApp: {number}",
        "Binance VIP Trading Signals. 99% accuracy. Pay monthly fee of Rs.{amount} for access."
    ]
    
    # Benign Templates
    benign_templates = [
        "Hey, are we still meeting for dinner at {time}?",
        "Your Swiggy order #45829 is on the way. Delivery executive will be there in 15 mins.",
        "Salary of Rs.{amount} credited to your account XX4521 on 01-Mar-2026. Avail Bal: Rs.1,45,200.",
        "Reminder: Doctor appointment scheduled for tomorrow at {time}. Please arrive 10 minutes early.",
        "Your Amazon package is out for delivery. OTP to share with agent is {otp}.",
        "OTP for login to your HDFC account is {otp}. Do not share this with anyone.",
        "Happy Birthday! Have a wonderful year ahead. Let's catch up soon.",
        "Meeting pushed to {time}. Please check the updated invite.",
        "Did you watch the match yesterday? What a crazy finish!",
        "Your Uber trip has ended. Total fare: Rs.{small_amount}.",
        "Thanks for shopping with Myntra! Your order will be delivered by Thursday.",
        "Can you send me the presentation file before EOD?",
        "WiFi bill generated for March. Amount due Rs.{small_amount}. Pay by 15th.",
        "Boarding pass for Air India flight AI452 is attached. Safe travels!",
        "Flight delayed by 45 minutes due to bad weather at destination."
    ]
    
    # Dictionaries for substitution
    banks = ["SBI", "HDFC", "ICICI", "Axis Bank", "Punjab National Bank", "Kotak", "Bank of Baroda", "Canara Bank", "Union Bank", "Yes Bank"]
    url_domains = ["update-kyc.in", "verify-account-info.com", "secure-login.xyz", "claim-reward-now.net", "official-portal.co", "refund-processing.online"]
    brands = ["Amazon", "Flipkart", "Reliance", "Tata", "Jio", "Airtel", "Paytm"]
    times = ["10:00 AM", "2:30 PM", "5:00 PM", "7:45 PM", "9:00 AM", "4:15 PM"]
    
    data = []
    
    # Helper to generate rows
    def append_rows(template_list, label, category, count):
        for _ in range(count):
            template = random.choice(template_list)
            text = template.format(
                bank=random.choice(banks),
                url=f"http://{random.choice(['www.', '', 'secure.'])}{random.choice(brands).lower()}-{random.choice(url_domains)}",
                amount=random.choice([5000, 10000, 25000, 50000, 100000, 49999, 9999]),
                small_amount=random.choice([100, 250, 500, 999, 1500, 2000]),
                number=f"+91-{random.randint(6000000000, 9999999999)}",
                service=random.choice(["Instagram", "Facebook", "Gmail", "Apple ID", "WhatsApp"]),
                brand=random.choice(brands),
                upi_id=f"{random.randint(6000000000, 9999999999)}@{random.choice(['ybl', 'okicici', 'oksbi', 'paytm'])}",
                time=random.choice(times),
                otp=random.randint(100000, 999999)
            )
            # Add some minor noise or variations occasionally
            if random.random() < 0.1:
                text = text.replace("Rs.", "INR ")
            if random.random() < 0.05:
                text = text.upper()
                
            data.append([category, label, text, "en" if "Aapke" not in text else "hi"])

    # Generate records
    append_rows(phishing_templates, "scam", "phishing", targets["phishing"])
    append_rows(upi_templates, "scam", "upi_fraud", targets["upi_fraud"])
    append_rows(invest_templates, "scam", "investment_scam", targets["investment_scam"])
    append_rows(benign_templates, "safe", "benign", targets["benign"])
    
    # Shuffle dataset
    random.shuffle(data)
    
    # Write to CSV
    with open(TEXT_DATASET_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'label', 'text', 'language'])
        writer.writerows(data)
        
    print(f"Generated {len(data)} text samples in {TEXT_DATASET_PATH}")


# ==========================================
# 2. URL DATASET GENERATOR (~20,000 samples)
# ==========================================

def generate_url_dataset(num_samples=20000):
    print(f"Generating {num_samples} URL samples...")
    
    targets = {
        "phishing": int(num_samples * 0.60),  # 12,000
        "benign": int(num_samples * 0.40)     # 8,000
    }
    
    # Benign building blocks
    legit_domains = [
        "google.com", "youtube.com", "facebook.com", "amazon.in", "flipkart.com",
        "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com", "axisbank.com",
        "incometax.gov.in", "uidai.gov.in", "irctc.co.in", "makemytrip.com", "myntra.com",
        "wikipedia.org", "twitter.com", "instagram.com", "linkedin.com", "github.com",
        "stackoverflow.com", "reddit.com", "netflix.com", "primevideo.com", "hotstar.com",
        "zomato.com", "swiggy.com", "bookmyshow.com", "paytm.com", "phonepe.com"
    ]
    
    legit_paths = ["", "/login", "/home", "/about", "/contact", "/products", "/checkout", "/profile", "/settings"]
    
    # Phishing building blocks
    phishing_brands = ["sbi", "hdfc", "paytm", "amazon", "flipkart", "irctc", "uidai", "kyc", "jio", "airtel", "income-tax"]
    phishing_keywords = ["update", "verify", "secure", "login", "auth", "confirm", "reward", "cashback", "refund"]
    phishing_tlds = [".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".co.vu", ".buzz", ".top", ".cc", ".icu", ".online", ".site"]
    free_hosts = [".herokuapp.com", ".netlify.app", ".vercel.app", ".blogspot.com", ".weebly.com", ".wixsite.com"]
    
    data = []
    
    # Generate benign URLs
    for _ in range(targets["benign"]):
        protocol = random.choice(["https://", "http://", "https://www."])
        domain = random.choice(legit_domains)
        path = random.choice(legit_paths)
        if random.random() < 0.2:
            path += f"?id={random.randint(1000,9999)}"
        url = f"{protocol}{domain}{path}"
        data.append(["benign", "safe", url])
        
    # Generate Phishing URLs
    for _ in range(targets["phishing"]):
        protocol = random.choice(["http://", "https://"])
        brand = random.choice(phishing_brands)
        kw = random.choice(phishing_keywords)
        
        # Determine phishing tactic
        tactic = random.choice(["typosquat", "suspicious_tld", "free_host", "ip_address", "subdomain"])
        
        if tactic == "typosquat":
            # e.g., amazon -> arnazon
            b2 = brand.replace('m', 'rn').replace('l', '1').replace('o', '0').replace('i', 'l')
            if b2 == brand: b2 = brand + "-security"
            url = f"{protocol}{b2}.com/{kw}"
            
        elif tactic == "suspicious_tld":
            url = f"{protocol}{brand}-{kw}{random.choice(phishing_tlds)}/login.php"
            
        elif tactic == "free_host":
            url = f"{protocol}{brand}-{kw}{random.choice(free_hosts)}/"
            
        elif tactic == "ip_address":
            ip = f"{random.randint(11,250)}.{random.randint(1,250)}.{random.randint(1,250)}.{random.randint(1,250)}"
            url = f"{protocol}{ip}/{brand}/{kw}.html"
            
        elif tactic == "subdomain":
            # e.g. sbi.co.in.scamdomain.xyz
            tld2 = random.choice(phishing_tlds)
            url = f"{protocol}{brand}.co.in.security-check-portal{tld2}/verify"
            
        else:
            url = f"{protocol}www.{brand}-kyc-update.in/{kw}"
            
        data.append(["url_phishing", "scam", url])
        
    # Shuffle dataset
    random.shuffle(data)
    
    # Write to CSV
    with open(URL_DATASET_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'label', 'url'])
        writer.writerows(data)
        
    print(f"Generated {len(data)} URL samples in {URL_DATASET_PATH}")


if __name__ == "__main__":
    print("Starting Indian Scam Multi-Modal Dataset Generator laying foundation for ~50,000 samples...")
    generate_text_dataset(30000)
    generate_url_dataset(20000)
    print("Done! CSV files are located in backend/dataset/data/")
    print(f"Total samples generated: 50,000")
