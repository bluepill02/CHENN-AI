---
description: Fix Supabase redirecting to localhost instead of Vercel
---

# Fix Supabase Redirects

If your app redirects to `localhost` after signing in on Vercel, it means Supabase doesn't know about your Vercel URL.

## Steps to Fix

1.  **Go to Supabase Dashboard**
    Open your project in [Supabase](https://supabase.com/dashboard).

2.  **Navigate to Auth Settings**
    Go to **Authentication** > **URL Configuration**.

3.  **Update Site URL**
    - Set **Site URL** to your Vercel production URL (e.g., `https://chennai-community.vercel.app`).

4.  **Add Redirect URLs**
    - Under **Redirect URLs**, add the following:
        - `https://chennai-community.vercel.app/**`
        - `https://chennai-community.vercel.app/auth/callback`
    *(Replace `chennai-community.vercel.app` with your actual Vercel domain)*

5.  **Update Vercel Environment Variables**
    - Go to your Vercel Project Settings > Environment Variables.
    - Add a new variable:
        - `VITE_SITE_URL`: `https://your-vercel-app-url.vercel.app`

6.  **Redeploy**
    - Redeploy your app on Vercel for the changes to take effect.
