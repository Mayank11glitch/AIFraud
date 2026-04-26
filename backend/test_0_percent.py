import sys
import os

# Add backend to path
sys.path.append('d:/ASEP2/backend')

from services.scam_detection import process_text

try:
    result = process_text("Congratulations! You won $10,000,000 in the lottery. Send me your bank details right now or face legal action from the FBI.")
    print("Test 1 Risk Score:", result.risk_score)
    print("Test 1 Explanations:", [e.feature for e in result.explanations])
except Exception as e:
    print(f"Test 1 Failed: {e}")

try:
    result2 = process_text("Hey mom, I need you to send me some money on UPI, I'm stuck at the hospital.")
    print("Test 2 Risk Score:", result2.risk_score)
except Exception as e:
    print(f"Test 2 Failed: {e}")
