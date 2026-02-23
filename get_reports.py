import urllib.request
import json

req = urllib.request.Request("http://localhost:8002/auth/login", data=b'{"email": "citizen@demo.com", "password": "demo_password"}', headers={'Content-Type': 'application/json'})
token = json.loads(urllib.request.urlopen(req).read())['access_token']

req2 = urllib.request.Request("http://localhost:8002/api/reports/all", headers={'Authorization': f'Bearer {token}'})
reports = json.loads(urllib.request.urlopen(req2).read())
print(len(reports))
for r in reports[:2]:
    print(r.get('latitude'), r.get('longitude'))
