import requests

url = "http://localhost:8000/api/scan/text"
text = "Congratulations! You won $10,000,000 in the lottery. Send me your bank details right now or face legal action from the FBI."
payload = {'text': text, 'ephemeral': 'false'}

try:
    response = requests.post(url, data=payload)
    print("Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print(e)
