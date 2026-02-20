# Admin Portal Setup Instructions

## Prerequisites
- Node.js installed
- Python 3.10+ installed
- Backend API running on port 8000

## Setup Steps

### 1. Environment Configuration
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Make sure `VITE_ADMIN_API_KEY` matches the `API_SECRET_KEY` in your backend.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the Application
Open http://localhost:5173 in your browser.

## Default Admin Credentials
- Email: admin@sevasetu.gov
- Password: admin123

Note: You'll need to create this user in your backend database first using the `/api/auth/register` endpoint.

## API Endpoints Used
- `GET /api/dashboard` - Dashboard data
- `GET /api/reports/all` - All reports for admin view
- `PUT /api/reports/{id}/status` - Update report status
- `GET /api/analytics` - Analytics data
- `POST /api/auth/login` - Admin login

## Troubleshooting
1. Make sure the backend is running on port 8000
2. Verify the API key in .env matches the backend
3. Check that CORS is enabled in the backend
4. Ensure the admin user exists in the database