# Vercel Deployment Guide

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. GitHub repository connected to Vercel
3. Backend API URL (your Spring Boot backend)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `Syed-Zeeyan/Ticketing-System`
4. Select the repository and click "Import"

### 2. Configure Project Settings

**Root Directory:** Set to `ticketing-frontend`

**Framework Preset:** Next.js (auto-detected)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### 3. Environment Variables

Add the following environment variable in Vercel:

- **Variable Name:** `NEXT_PUBLIC_API_URL`
- **Value:** Your backend API URL (e.g., `https://your-backend-api.com/api` or `http://localhost:8080/api` for local testing)

**To add environment variables:**
1. In your Vercel project settings
2. Go to "Settings" → "Environment Variables"
3. Add `NEXT_PUBLIC_API_URL` with your backend URL
4. Make sure to add it for all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy" button
2. Vercel will automatically:
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Deploy to production

### 5. Post-Deployment

After deployment, your frontend will be available at:
- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-git-branch.vercel.app`

## Important Notes

### Backend API Configuration

Make sure your backend:
- Is accessible from the internet (not just localhost)
- Has CORS configured to allow requests from your Vercel domain
- Is running and accessible at the URL you set in `NEXT_PUBLIC_API_URL`

### CORS Configuration

Update your Spring Boot backend's CORS configuration to include your Vercel domain:

```java
.allowedOrigins("https://your-project.vercel.app", "https://your-project-*.vercel.app")
```

### Environment Variables in Vercel

You can set different API URLs for different environments:
- **Production:** Your production backend URL
- **Preview:** Your staging/test backend URL
- **Development:** `http://localhost:8080/api` (for local development)

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (Vercel uses Node 18+ by default)
- Check build logs in Vercel dashboard

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS settings
- Ensure backend is accessible from the internet
- Check browser console for CORS errors

### Environment Variables Not Working

- Make sure variable name starts with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing environment variables
- Check that variables are set for the correct environment (Production/Preview/Development)

## Continuous Deployment

Vercel automatically deploys:
- **Production:** On push to `main` branch
- **Preview:** On push to any other branch or pull request

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

**Repository:** https://github.com/Syed-Zeeyan/Ticketing-System.git

