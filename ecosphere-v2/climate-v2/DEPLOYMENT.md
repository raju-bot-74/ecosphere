# Deployment Guide

## Frontend Deployment (Vercel — Free & Recommended)

### Step 1: Push to GitHub
Make sure your code is pushed to GitHub first.

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"New Project"**
3. Select your `sustainable-climate-action` repository
4. Set **Root Directory** to `frontend`
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url/api`
6. Click **"Deploy"**
7. Your site is live at `https://your-app.vercel.app`

Auto-deployment triggers on every push to `main`.

---

## Backend Deployment (Railway — Free & Recommended)

### Step 1: Deploy on Railway
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Set **Root Directory** to `backend`
5. Railway auto-detects Node.js and deploys
6. Add environment variables from `.env.example`
7. Your API is live at the provided Railway URL

---

## Alternative: Heroku (Backend)

1. Create a Heroku account at [heroku.com](https://heroku.com)
2. Install Heroku CLI: `npm install -g heroku`
3. Login: `heroku login`
4. Create app: `heroku create sustainable-climate-api`
5. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret
   ```
6. Deploy:
   ```bash
   git subtree push --prefix backend heroku main
   ```

---

## Docker Deployment (Self-Hosted)

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend builds successfully (`npm run build`)
- [ ] API health check passes: `GET /api/health`
- [ ] Frontend connects to backend API
- [ ] Domain/SSL configured (Vercel handles this automatically)

---

## Troubleshooting

**Frontend build fails:**
```bash
cd frontend && npm run build
# Check for TypeScript errors
```

**Backend won't start:**
```bash
cd backend && npm run dev
# Check for missing environment variables
```

**API not reachable from frontend:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS configuration in `backend/src/index.ts`
