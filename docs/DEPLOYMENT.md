# Deployment Guide - Render & Vercel

This guide walks you through deploying SewaSetu to Render (backend) and Vercel (frontend).

---

## 🚀 Backend Deployment (Render)

### Prerequisites
- Render account (free tier works)
- GitHub repository pushed with your code
- AWS account with Bedrock access enabled
- Supabase project created

---

### Step 1: Prepare Backend for Deployment

#### 1.1 Verify CORS Configuration
The backend is already configured to allow all origins:
```python
# backend/main.py (line 547-553)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 1.2 Check for Hardcoded URLs
✅ **All hardcoded localhost URLs have been removed:**
- `backend/ai_service.py`: Now uses environment variable only
- `backend/admin_map.html`: Uses `window.location.origin` (dynamic)

---

### Step 2: Create Render Web Service

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository:**
   - Select your SewaSetu repository
   - Click "Connect"

4. **Configure Service:**
   ```
   Name: sewasetu-backend
   Region: Choose closest to your users (e.g., Singapore, Oregon)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```

5. **Instance Type:** Select "Free" (or "Starter" for better performance)

---

### Step 3: Add Environment Variables

In Render Dashboard → Environment, add these variables:

**Required Variables:**
```env
AWS_ACCESS_KEY_ID=<your_aws_access_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
AWS_REGION=us-east-1
SUPABASE_URL=<your_supabase_project_url>
SUPABASE_KEY=<your_supabase_anon_key>
API_SECRET_KEY=<generate_a_strong_random_string>
```

**Optional (only if using external AI service):**
```env
AI_API_URL=
```

**How to get these values:**
- **AWS Credentials:** AWS Console → IAM → Users → Security Credentials
- **Supabase:** Supabase Dashboard → Project Settings → API
- **API_SECRET_KEY:** Generate using: `openssl rand -hex 32`

💡 **Tip:** See `backend/.env.render.example` for a complete template.

---

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies from `requirements.txt`
   - Start the FastAPI server
   - Assign a public URL (e.g., `https://sewasetu-backend.onrender.com`)

3. **Check Logs:**
   - Go to "Logs" tab to verify startup
   - Look for: `✅ All required environment variables loaded successfully!`

4. **Test API:**
   - Visit: `https://your-service.onrender.com/`
   - Expected response: `{"status": "active", "service": "SewaSetu Backend", "ai_mode": "Amazon Bedrock"}`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

#### 1.1 Update Environment Variables
Edit `citizen-portal/.env`:
```env
VITE_API_URL=https://sewasetu-backend.onrender.com
VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_KEY=<your_supabase_anon_key>
```

**Important:** Replace with your actual Render URL and Supabase credentials.

---

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
cd citizen-portal
npm install -g vercel
vercel login
vercel
```

Follow the prompts:
- Project name: `sewasetu-citizen-portal`
- Build command: `npm run build`
- Output directory: `dist`

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: citizen-portal
   Build Command: npm run build
   Output Directory: dist
   ```
4. Add Environment Variables (same as Step 1.1)
5. Click "Deploy"

---

### Step 3: Update CORS (If Needed)

If your frontend domain is different from `*`, update backend CORS:

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sewasetu-citizen-portal.vercel.app",
        "https://your-custom-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then redeploy the backend on Render.

---

## 🔧 Troubleshooting

### Issue 1: "CORS Error" in Frontend
**Solution:**
1. Verify backend CORS allows your frontend domain
2. Check Network tab in browser DevTools
3. Ensure `VITE_API_URL` in frontend matches backend URL exactly

### Issue 2: "Environment Variables Missing" in Backend Logs
**Solution:**
1. Go to Render Dashboard → Environment
2. Verify all variables are set (no typos)
3. Click "Manual Deploy" to restart service

### Issue 3: Backend Returns 500 Error
**Solution:**
1. Check Render Logs for error details
2. Verify AWS credentials are valid
3. Ensure Supabase URL and key are correct

### Issue 4: Admin Login Not Working
**Solution:**
1. Check browser console for errors
2. Verify `localStorage` is allowed (not blocked by browser)
3. Ensure you're using credentials: `admin` / `admin123`

---

## 🎯 Post-Deployment Checklist

- [ ] Backend health check returns `{"status": "active"}`
- [ ] Frontend loads without CORS errors
- [ ] Can register/login as Citizen
- [ ] Can submit a report with image upload
- [ ] Can view reports on map (Home page)
- [ ] Can login as Admin (`admin`/`admin123`)
- [ ] Admin can see all reports on dashboard
- [ ] Admin can update report status

---

## 📊 Performance Optimization (Optional)

### Enable Caching
Add to `backend/main.py`:
```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Optimize Images
Consider using Supabase Image Transformations:
```python
# Example: Resize images to 800px width
public_url = supabase.storage.from_(bucket_name).get_public_url(
    file_name,
    options={'transform': {'width': 800}}
)
```

---

## 🌍 Custom Domain (Optional)

### For Backend (Render)
1. Go to Render Dashboard → Settings → Custom Domains
2. Add your domain (e.g., `api.sewasetu.com`)
3. Update DNS records as instructed

### For Frontend (Vercel)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `sewasetu.com`)
3. Update DNS records as instructed

---

## 🔒 Security Recommendations

### Production Checklist
- [ ] Use strong `API_SECRET_KEY` (32+ characters random string)
- [ ] Rotate AWS credentials regularly
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Add rate limiting to API endpoints
- [ ] Implement proper admin authentication (not hardcoded)
- [ ] Enable HTTPS only (Render and Vercel do this by default)
- [ ] Never commit `.env` files or secrets to Git

---

## 📞 Support

If you encounter issues:
1. Check Render Logs: `Dashboard → Logs`
2. Check Vercel Logs: `Dashboard → Deployments → [Your Deployment] → Logs`
3. Open an issue on GitHub

---

<div align="center">
  <strong>🎉 Your SewaSetu is now live!</strong>
  <br>
  <sub>Share the URL with citizens and government officials to start making an impact.</sub>
</div>
