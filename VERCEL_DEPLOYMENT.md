# Vercel Deployment Guide

## Issue: Blank Page on Production

If you see a blank page when visiting your Vercel deployment, it's because the Supabase environment variables are not configured in Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Project Settings

1. Go to https://vercel.com/dashboard
2. Select your `plate-check` project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add Required Variables

Add the following environment variables:

**Variable 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://phnygsbbvcixnxwrbdhx.supabase.co`
- **Environment:** Production, Preview, Development (check all)

**Variable 2:**
- **Name:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** `sb_publishable_TByKldnTofmXVTcoVyyBMg_-DzD0JKb`
- **Environment:** Production, Preview, Development (check all)

### Step 3: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab
2. Click the three dots (`...`) on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** (unchecked)
5. Click **Redeploy**

**OR** simply push a new commit to GitHub (Vercel auto-deploys on push)

### Step 4: Verify

After redeployment completes:
1. Visit https://platecheck.vercel.app/
2. You should see the onboarding flow
3. Authentication should work

## Alternative: Deploy via CLI

If you prefer using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with environment variables
vercel --prod
```

During deployment, the CLI will ask for environment variables if they're not set.

## What These Variables Do

- `VITE_SUPABASE_URL` - Your Supabase project URL (for API calls)
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public API key for client-side auth

These are safe to expose in client-side code (they're public keys, not secrets).

## Important Notes

- The `VITE_` prefix is required for Vite to expose env vars to the browser
- Never commit `.env` file to git (already in `.gitignore`)
- Environment variables only affect new builds, not existing deployments
- After adding env vars, you must redeploy for changes to take effect
