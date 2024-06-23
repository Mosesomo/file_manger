#!/usr/bin/python3
import sys
import requests
import base64
import os

if len(sys.argv) != 4:
    print("Usage: python3 image_upload.py <image_path> <jwt_token> <parentId>")
    sys.exit(1)

file_path = sys.argv[1]
jwt_token = sys.argv[2]
parent_id = sys.argv[3]

if not os.path.isfile(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

file_name = file_path.split('/')[-1]

with open(file_path, 'rb') as image_file:
    file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

r_json = {
    'name': file_name,
    'type': 'image',
    'isPublic': True,
    'data': file_encoded,
    'parentId': parent_id
}
r_headers = {
    'Authorization': f'Bearer {jwt_token}'
}

r = requests.post("http://localhost:5000/api/upload", json=r_json, headers=r_headers)

# Print the raw response content
print(f"Status Code: {r.status_code}")
print(f"Response Content: {r.content}")

try:
    r_json_response = r.json()
    print(r_json_response)
except ValueError:
    print("Response is not in JSON format")
