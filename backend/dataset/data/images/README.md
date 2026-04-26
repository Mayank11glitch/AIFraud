# Image Dataset (Screenshots for OCR + Visual Feature Extraction)

Target Size: 2,000 - 5,000 images

## Sourcing
Since image datasets are massive, they are not bundled in this repo directly. To populate this folder for OCR and visual training, source from:

1. **WhatsApp & SMS Spam Screenshots**: Self-collected or from Kaggle "SMS Spam Collection" variations.
2. **Fake Payment Apps**: Search for screenshots of spoofed Paytm/PhonePe successful payment screens.
3. **Investment Ads**: Save cryptocurrency trading and "double your money" posters found on Telegram/Instagram.

## Structure
Place your images in the respective folders:
- `data/images/scam/`
- `data/images/benign/`

The ML pipeline `data_loader_ml.py` will automatically read and label images based on their parent directory.
