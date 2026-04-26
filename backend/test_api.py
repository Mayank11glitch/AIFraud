import requests

url = "http://localhost:8000/api/scan/text"
payload = {'text': 'Congratulations! You won the lottery.', 'ephemeral': 'false'}

try:
    response = requests.post(url, data=payload)
    print("Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print(e)
