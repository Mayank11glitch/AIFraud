import sys
sys.path.append('d:/ASEP2/backend')
from services.scam_detection import process_image
import numpy as np
from PIL import Image
import io

img = Image.new('RGB', (100, 100), color = 'white')
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='PNG')
img_byte_arr = img_byte_arr.getvalue()

print(process_image(img_byte_arr).risk_score)
