# Deployment Guide - Exam Portal

This guide walks you through deploying the Exam Portal to GitHub and Vercel.

## Step 1: Verify Local Setup ✓

### Environment Variables

Ensure `.env.local` exists with:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-portal?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret-key-min-32-characters
```

### Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` and test all features:
- Admin login and question creation
- Student email addition and exam access
- Results viewing

---

## Step 2: Push to GitHub

### Initialize Git Repository

```bash
# Initialize git in the project directory
git init

# Add all files (except those in .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: Exam Portal Next.js application"

# Rename branch to main (if needed)
git branch -M main

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Create Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the **+** icon → **New repository**
3. Repository name: `exam-portal-nextjs`
4. Description: "Secure online MCQ examination system"
5. Choose **Public** or **Private**
6. Do NOT initialize with README (we already have one)
7. Click **Create repository**

Then run the push commands above.

---

## Step 3: Deploy on Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy to Vercel
vercel

# Follow the prompts:
# - Confirm project setup
# - Add environment variables when asked
# - Set production deployment
```

### Option B: Using Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Click **New Project**
3. Click **Import Git Repository**
4. Select your GitHub repository
5. Click **Import**

#### Configure Environment Variables

1. In Vercel project settings, go to **Settings** → **Environment Variables**
2. Add the following variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `MONGO_URI` | Your MongoDB Atlas connection string | Production, Preview, Development |
| `JWT_SECRET` | Your secure JWT secret (min 32 chars) | Production, Preview, Development |

3. Click **Save**

#### Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Your app is live! 🎉

---

## Step 4: Post-Deployment Verification

### Test Your Deployment

1. Visit your Vercel deployment URL
2. Test admin features:
   - Login with default password: `admin123`
   - Change password immediately
   - Add a test question
   - Add a test student email
3. Test student features:
   - Access with test email
   - Complete exam
   - View results

### First-Time Admin Setup

⚠️ **Important**: On first load, the app will:
- Create an admin user with default password `admin123`
- You MUST change this in Settings → Change Password

---

## Troubleshooting

### Build Fails on Vercel

**Error: "MONGO_URI environment variable is not defined"**
- Verify environment variables are set in Vercel dashboard
- Redeploy after adding variables

**Error: "MongoDB connection failed"**
- Check MongoDB Atlas connection string
- Verify IP whitelist includes Vercel servers (0.0.0.0/0)
- Test connection locally first

### Deployment Shows 500 Error

1. Check Vercel deployment logs:
   - Go to Vercel dashboard
   - Click on your project
   - Click **Deployments**
   - Click on failed deployment
   - Scroll to **Logs** tab

2. Common issues:
   - Missing environment variables
   - MongoDB connection timeout
   - Node.js version incompatibility

### How to View Logs

**Vercel Logs:**
```
Vercel Dashboard → Deployments → Select Deployment → Logs
```

**MongoDB Connection Test:**
Add this to a test route temporarily:
```javascript
export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: "Connected" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/exam-portal?retryWrites=true&w=majority` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-super-secret-key-at-least-32-characters-long` |

---

## GitHub Repository Best Practices

### .gitignore is Already Configured

The `.gitignore` file excludes:
- `node_modules/`
- `.next/`
- `.env.local` (sensitive data)
- IDE and OS files

### Create Branches for Features

```bash
# Create feature branch
git checkout -b feature/add-timer-feature

# Make changes...

# Commit changes
git add .
git commit -m "feat: Add exam timer functionality"

# Push to GitHub
git push origin feature/add-timer-feature

# Create Pull Request on GitHub
```

---

## Continuous Deployment

After initial setup, Vercel automatically deploys when you:
1. Push to `main` branch → Production deployment
2. Push to other branches → Preview deployments
3. Create Pull Requests → Preview deployments

To disable auto-deploy:
- Vercel Dashboard → Project Settings → Git → Uncheck auto-deploy

---

## Scaling & Performance Tips

### For More Users

1. **MongoDB Optimization**
   - Add indexes on commonly queried fields
   - Monitor connection pool usage
   - Use read replicas for better performance

2. **Vercel Optimization**
   - Enable edge caching for static assets
   - Use Vercel Analytics to identify slow routes
   - Scale serverless functions as needed

3. **Next.js Optimization**
   - Enable incremental static regeneration
   - Optimize images with `next/image`
   - Monitor Core Web Vitals

---

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [GitHub Docs](https://docs.github.com)

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Git commands
git add .
git commit -m "Your message"
git push origin main

# Vercel deployment
vercel
vercel --prod  # Production deployment only
```

---

**Last Updated**: June 2024
**Version**: 1.0.0
