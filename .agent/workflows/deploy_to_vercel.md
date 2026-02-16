---
description: Deploy the Chennai Community App to Vercel
---

# Deploy to Vercel

This workflow will guide you through deploying your application to Vercel.

## Prerequisites
- You must have a Vercel account.
- You must have the Vercel CLI installed (`npm i -g vercel`) or use `npx vercel`.

## Steps

1.  **Login to Vercel** (if not already logged in)
    ```powershell
    npx vercel login
    ```

2.  **Deploy**
    Run the following command to start the deployment process.
    - Accept default settings for most prompts.
    - Ensure the build command is `npm run build` (or `vite build`).
    - Ensure the output directory is `dist` (Vite default).

    ```powershell
    npx vercel
    ```

3.  **Set Environment Variables**
    Once the project is linked, you MUST add your environment variables to Vercel.
    Go to your Vercel Dashboard > Project Settings > Environment Variables and add:

    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_GROQ_API_KEY`
    - `VITE_AZURE_OPENAI_ENDPOINT`
    - `VITE_AZURE_OPENAI_KEY`
    - `VITE_AZURE_OPENAI_DEPLOYMENT`
    - `VITE_HUGGING_FACE_API_KEY`

    *Note: You can find these values in your `.env.local` file.*

4.  **Redeploy (if needed)**
    If you added environment variables *after* the first deploy, you need to redeploy:
    ```powershell
    npx vercel --prod
    ```
