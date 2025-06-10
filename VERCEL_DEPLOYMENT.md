# Vercel Deployment Guide

This project has been configured for deployment on Vercel. Here's what you need to know:

## Files Added/Modified for Vercel

### 1. `vercel.json`
Configures Vercel to:
- Build the Node.js backend from `dist/index.js`
- Serve the React frontend from `dist/public`
- Route API calls to `/api/*` to the backend
- Route all other requests to the frontend

### 2. `package.json`
- Added `vercel-build` script that runs the build process

### 3. `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces deployment size and time

### 4. `vite.config.ts`
- Removed Replit-specific plugins that would cause issues on Vercel

### 5. `client/index.html`
- Removed Replit-specific script

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts to configure your project.

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

## Environment Variables

If your app uses environment variables, make sure to set them in the Vercel dashboard:
1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add your variables (e.g., database URLs, API keys, etc.)

## Database Considerations

If you're using a database:
- Make sure your database is accessible from Vercel's servers
- Consider using Vercel's database integrations or external services like PlanetScale, Neon, or Supabase
- Update your database connection strings in environment variables

## Notes

- The build process creates both frontend and backend bundles
- API routes are handled by the Express server
- Static files are served from the built React app
- The app will run in production mode on Vercel