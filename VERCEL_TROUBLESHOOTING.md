# Vercel 404 Error Troubleshooting

## Common Causes of 404 Errors

### 1. Root Directory Not Set Correctly (MOST COMMON)

**Problem:** Vercel is trying to build from the repository root instead of `ticketing-frontend/`

**Solution:**
1. Go to your Vercel project dashboard
2. Click on your project → **Settings** → **General**
3. Scroll down to **Root Directory**
4. Click **Edit**
5. Select **Other** and enter: `ticketing-frontend`
6. Click **Save**
7. **Redeploy** the project

### 2. Build Output Not Found

**Problem:** Build completes but files aren't in the expected location

**Check:**
- In Vercel deployment logs, verify the build actually ran
- Look for "Creating an optimized production build" in logs
- Build should take 1-3 minutes, not 100ms

**Solution:**
- Ensure Root Directory is set to `ticketing-frontend`
- Vercel will automatically detect Next.js and use correct build settings

### 3. Missing Environment Variables

**Problem:** App tries to load resources but fails due to missing config

**Solution:**
1. Go to **Settings** → **Environment Variables**
2. Add `NEXT_PUBLIC_API_URL` with your backend URL
3. Redeploy after adding variables

### 4. API Routes Returning 404

**Problem:** Next.js API routes (`/api/auth/*`) return 404

**Check:**
- These are server-side routes that need to be deployed correctly
- Verify they're in `ticketing-frontend/app/api/` directory

**Solution:**
- Ensure Root Directory is set correctly
- API routes should work automatically with Next.js on Vercel

## Step-by-Step Fix

### Step 1: Verify Root Directory Setting

1. Open Vercel Dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Check **Root Directory** - should be `ticketing-frontend`
5. If not, set it and save

### Step 2: Check Build Logs

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check **Build Logs**
4. Look for:
   - ✅ "Creating an optimized production build"
   - ✅ "Compiled successfully"
   - ✅ "Generating static pages"
   - ❌ If you see "Build Completed in /vercel/output [106ms]" - build didn't run

### Step 3: Verify Build Output

In build logs, you should see:
```
Route (app)                              Size     First Load JS
┌ λ /                                    138 B          82.1 kB
├ ○ /_not-found                          869 B          82.8 kB
├ λ /admin                               4.92 kB         161 kB
...
```

If you don't see this, the build didn't run correctly.

### Step 4: Redeploy

1. After fixing Root Directory, click **Redeploy**
2. Or push a new commit to trigger automatic deployment
3. Wait for build to complete (should take 1-3 minutes)

## Quick Checklist

- [ ] Root Directory set to `ticketing-frontend` in Vercel settings
- [ ] Build logs show Next.js build process (not just 100ms completion)
- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set
- [ ] Build output shows route list with sizes
- [ ] Deployment status is "Ready" (not "Error")

## Still Getting 404?

### Check Browser Console

1. Open your Vercel URL in browser
2. Open Developer Tools (F12)
3. Check **Console** tab for errors
4. Check **Network** tab to see which resources return 404

### Common 404 Sources:

- `/api/tickets` - Backend API (not frontend issue)
- `/favicon.ico` - Missing favicon (not critical)
- Static assets - Check if they're in `public/` folder
- Next.js chunks - Should be auto-generated

### Verify Deployment URL

Make sure you're visiting:
- `https://your-project.vercel.app` (not a subdirectory)
- The root URL should redirect to `/login` or `/dashboard`

## Contact Support

If issues persist:
1. Share your Vercel deployment logs
2. Share browser console errors
3. Verify Root Directory setting screenshot
4. Check Vercel status page for outages

---

**Remember:** The most common fix is setting the **Root Directory** to `ticketing-frontend` in Vercel project settings!

