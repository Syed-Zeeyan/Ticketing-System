# Backend Deployment Guide

Your Spring Boot backend needs to be deployed and accessible from the internet for your Vercel frontend to work.

## Quick Testing Solution (Temporary)

### Option 1: Use ngrok (Free, for testing only)

**ngrok** creates a public URL that tunnels to your local backend.

1. **Install ngrok:**
   - Download from https://ngrok.com/download
   - Or: `choco install ngrok` (Windows) or `brew install ngrok` (Mac)

2. **Start your backend locally:**
   ```bash
   mvn spring-boot:run
   ```
   Backend should be running on `http://localhost:8080`

3. **Start ngrok:**
   ```bash
   ngrok http 8080
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Set in Vercel:**
   - Environment Variable: `NEXT_PUBLIC_API_URL`
   - Value: `https://abc123.ngrok.io/api`
   - **Note:** This URL changes every time you restart ngrok (unless you have a paid plan)

**⚠️ Warning:** ngrok URLs are temporary and change on restart. Only use for testing!

---

## Permanent Deployment Options (Free Tiers Available)

### Option 1: Railway (Recommended - Easiest)

**Free tier:** $5 credit/month, then pay-as-you-go

1. **Sign up:** https://railway.app
2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
3. **Configure:**
   - Railway auto-detects Spring Boot
   - Set Root Directory to: `.` (root of repo)
   - Add environment variables:
     - `DATABASE_URL` (Railway can provision PostgreSQL)
     - `JWT_SECRET` (generate a secure random string)
     - `DATABASE_USERNAME`
     - `DATABASE_PASSWORD`
4. **Deploy:**
   - Railway will build and deploy automatically
   - Get your backend URL (e.g., `https://your-app.railway.app`)
5. **Set in Vercel:**
   - `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app/api`

---

### Option 2: Render (Free tier available)

**Free tier:** Free PostgreSQL, but backend sleeps after 15 min inactivity

1. **Sign up:** https://render.com
2. **Create new Web Service:**
   - Connect GitHub repository
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/ticketing-backend-1.0.0.jar`
   - Environment: `Docker` or `Java`
3. **Add PostgreSQL Database:**
   - Create new PostgreSQL database
   - Copy connection string
4. **Set environment variables:**
   - `DATABASE_URL` = PostgreSQL connection string
   - `JWT_SECRET` = your secret key
5. **Deploy and get URL:**
   - Render provides: `https://your-app.onrender.com`
6. **Set in Vercel:**
   - `NEXT_PUBLIC_API_URL` = `https://your-app.onrender.com/api`

---

### Option 3: Fly.io (Free tier available)

**Free tier:** 3 shared VMs, 3GB storage

1. **Install Fly CLI:**
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Sign up:** https://fly.io
3. **Login:**
   ```bash
   fly auth login
   ```

4. **Create app:**
   ```bash
   fly launch
   ```
   - Follow prompts
   - Select region
   - Don't deploy database yet

5. **Add PostgreSQL:**
   ```bash
   fly postgres create
   fly postgres attach <postgres-app-name>
   ```

6. **Set secrets:**
   ```bash
   fly secrets set JWT_SECRET=your-secret-key
   ```

7. **Deploy:**
   ```bash
   fly deploy
   ```

8. **Get URL:**
   - Your app will be at: `https://your-app.fly.dev`
   - Set in Vercel: `NEXT_PUBLIC_API_URL` = `https://your-app.fly.dev/api`

---

### Option 4: Heroku (Paid, but reliable)

**Note:** Heroku removed free tier, but has a low-cost hobby tier

1. **Sign up:** https://heroku.com
2. **Install Heroku CLI:**
   ```bash
   # Windows
   choco install heroku-cli
   ```

3. **Login:**
   ```bash
   heroku login
   ```

4. **Create app:**
   ```bash
   heroku create your-app-name
   ```

5. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

6. **Set config vars:**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   ```

7. **Deploy:**
   ```bash
   git push heroku main
   ```

8. **Get URL:**
   - Your app: `https://your-app-name.herokuapp.com`
   - Set in Vercel: `NEXT_PUBLIC_API_URL` = `https://your-app-name.herokuapp.com/api`

---

## Required Environment Variables for Backend

Regardless of which platform you choose, set these:

- `DATABASE_URL` - PostgreSQL connection string (usually auto-provided)
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - Secure random string (minimum 256 bits)
- `JWT_ACCESS_EXPIRATION` - Access token expiration (default: 3600000)
- `JWT_REFRESH_EXPIRATION` - Refresh token expiration (default: 86400000)

## CORS Configuration

After deploying, update your Spring Boot `SecurityConfig.java` to allow your Vercel domain:

```java
.allowedOrigins(
    "https://your-vercel-app.vercel.app",
    "https://your-vercel-app-*.vercel.app"
)
```

## Quick Start Recommendation

**For quick testing:** Use **ngrok** (5 minutes)
**For permanent deployment:** Use **Railway** (easiest) or **Render** (free tier)

---

## Next Steps After Backend Deployment

1. ✅ Deploy backend to one of the platforms above
2. ✅ Get your backend URL (e.g., `https://your-backend.railway.app`)
3. ✅ Add `NEXT_PUBLIC_API_URL` in Vercel with value: `https://your-backend.railway.app/api`
4. ✅ Update CORS in backend to allow Vercel domain
5. ✅ Redeploy Vercel frontend
6. ✅ Test login functionality

---

**Need help?** Check the platform-specific documentation or ask for assistance with a specific deployment platform.

