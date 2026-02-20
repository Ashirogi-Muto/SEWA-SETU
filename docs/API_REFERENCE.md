# API Reference

## Base URL
```
http://localhost:8000
```

For production: `https://api.sewasetu.in` (to be deployed)

---

## Authentication

### Register User
Create a new citizen account (no password required for demo).

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "instant-auth"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  },
  "message": "Registration successful"
}
```

---

### Login
Instant login for existing users (email-only auth).

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "instant-auth"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Note:** Password is not validated in hackathon mode. If user doesn't exist, they are auto-registered.

---

## Reports

### Submit Report
Create a new civic issue report with optional image upload.

**Endpoint:** `POST /api/reports/submit`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Issue description (supports Hinglish) |
| `latitude` | float | Yes | Location latitude |
| `longitude` | float | Yes | Location longitude |
| `address` | string | No | Human-readable address |
| `images` | file[] | No | Up to 3 images (JPEG/PNG, max 5MB each) |

**Example Request (using `curl`):**
```bash
curl -X POST http://localhost:8000/api/reports/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "description=Gali ki light nahi aa rahi" \
  -F "latitude=28.6139" \
  -F "longitude=77.2090" \
  -F "address=Connaught Place, New Delhi" \
  -F "images=@photo1.jpg"
```

**Response:**
```json
{
  "message": "Report submitted successfully",
  "id": "123456",
  "category": "Street Lighting",
  "confidence": 94
}
```

**AI Processing:**
- Report is automatically analyzed by AWS Bedrock
- Returns classified category, severity, and confidence score
- Image uploaded to Supabase Storage (if provided)

---

### Get User Reports
Fetch all reports submitted by the current user.

**Endpoint:** `GET /api/reports/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "123456",
    "description": "Gali ki light nahi aa rahi",
    "category": "Street Lighting",
    "status": "pending",
    "confidence": 94,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, New Delhi",
    "image_url": "https://storage.supabase.co/...",
    "created_at": "2026-02-15T14:30:00Z",
    "user_email": "user@example.com"
  }
]
```

---

### Get All Reports (Admin)
Fetch all reports from all users (for admin dashboard).

**Endpoint:** `GET /api/reports/all`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "123456",
    "description": "Pothole on main road",
    "category": "Roads/Potholes",
    "status": "in_progress",
    "severity": "High",
    "confidence": 96,
    "impact": "Affects 2000+ daily commuters, risk of vehicle damage",
    "estimated_repair_time": "3-5 days",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "image_url": "https://...",
    "created_at": "2026-02-14T10:20:00Z",
    "user_email": "citizen1@example.com"
  },
  ...
]
```

---

### Update Report Status (Admin)
Change the status of a report (admin only).

**Endpoint:** `PATCH /api/reports/{report_id}/status`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | Yes | New status: `pending`, `in_progress`, or `resolved` |

**Example Request:**
```bash
curl -X PATCH "http://localhost:8000/api/reports/123456/status?status=in_progress"
```

**Response:**
```json
{
  "message": "Status updated",
  "report_id": "123456",
  "new_status": "in_progress"
}
```

---

## AI Analysis

### Analyze Report (AI Service)
Advanced endpoint for analyzing text or audio reports.

**Endpoint:** `POST /api/v1/analyze-report`

**Request Body (Text):**
```json
{
  "text": "Sadak pe gadda hai, bahut bada hole hai"
}
```

**Request Body (Audio):**
```json
{
  "audio_file": "<base64_encoded_audio>"
}
```

**Response:**
```json
{
  "category": "Roads/Potholes",
  "severity": "High",
  "impact": "Large pothole causing traffic disruption and vehicle damage risk",
  "estimated_repair_time": "48-72 hours",
  "confidence": 97,
  "translated_text": "There is a hole in the road, a very large hole"
}
```

**Note:** This endpoint uses AWS Bedrock for advanced NLP and AWS Transcribe for audio processing.

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error: description field is required"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "detail": "Report not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "AWS Bedrock service unavailable, falling back to simulated AI"
}
```

---

## Rate Limits

| Tier | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free (Citizen) | 10 | 100 |
| Admin | 100 | 10,000 |
| Enterprise (Future) | Unlimited | Unlimited |

---

## Webhook Events (Future)

For government department integrations, SewaSetu will support webhooks:

```json
POST https://your-govt-system.in/webhook
{
  "event": "report.created",
  "report_id": "123456",
  "category": "Water Supply",
  "severity": "Critical",
  "location": {...},
  "timestamp": "2026-02-15T14:30:00Z"
}
```

---

## SDK Support (Planned)

- **Python SDK:** `pip install sewasetu-sdk`
- **JavaScript SDK:** `npm install @sewasetu/js-sdk`
- **Mobile SDKs:** Android (Kotlin), iOS (Swift)

Example (Python):
```python
from sewasetu import Client

client = Client(api_key='YOUR_API_KEY')
report = client.reports.create(
    description="Streetlight not working",
    latitude=28.6139,
    longitude=77.2090
)
print(f"Report ID: {report.id}, Category: {report.category}")
```

---

## Support

- **Email:** dev@sewasetu.in
- **Docs:** https://docs.sewasetu.in
- **GitHub:** https://github.com/yourusername/SewaSetu
