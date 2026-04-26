import sys
sys.path.append('d:/ASEP2/backend')
from services.scam_detection import process_text

print(process_text("Please call [REDACTED_PHONE]").risk_score)
print(process_text("test").risk_score)
