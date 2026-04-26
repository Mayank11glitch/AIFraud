import sys
import os

sys.path.append('d:/ASEP2/backend')
from services.scam_detection import process_url

try:
    result = process_url("http://example.com")
    print(result.risk_score)
except Exception as e:
    print(e)
