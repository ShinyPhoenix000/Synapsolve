# 🚀 SynapSolve Deployment Guide

## 📋 Overview

This guide covers deploying SynapSolve to various platforms including Vercel, Netlify, and Firebase Hosting. The application is a React + Vite SPA with Firebase backend integration.

## 🔧 Pre-Deployment Checklist

### Environment Variables Setup
Ensure all required environment variables are configured:

```bash
# Firebase (Public - safe for frontend)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI (Move to server-side in production)
VITE_OPENAI_API_KEY=your_openai_key

# Google Calendar
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret

# Neo4j
VITE_NEO4J_URI=your_neo4j_uri
VITE_NEO4J_USERNAME=neo4j
VITE_NEO4J_PASSWORD=your_password
```

### Build Verification
```bash
# Install dependencies
npm install

# Run build to verify everything works
npm run build

# Test the build locally
npm run preview
```

## 🌐 Vercel Deployment (Recommended)

### Automatic Deployment
1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
   - Set them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts to configure your project
```

### Custom Domain Setup
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

## 🎯 Netlify Deployment

### Drag & Drop Deployment
1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Go to [Netlify](https://netlify.com)
   - Drag the `dist` folder to the deploy area

### Git-Based Deployment
1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (in Environment Variables)

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all required environment variables

### Netlify CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

## 🔥 Firebase Hosting

### Setup Firebase Hosting
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   
   Configuration:
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Automatic builds: `No` (we'll build manually)

4. **Build and Deploy**
   ```bash
   # Build the application
   npm run build
   
   # Deploy to Firebase Hosting
   firebase deploy --only hosting
   ```

### Firebase Hosting Configuration
Create `firebase.json` in project root:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Production Security Configuration

### Firebase Security Rules
Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tickets - users can create, read their own tickets
    match /tickets/{ticketId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        (resource.data.submittedBy == request.auth.uid || 
         resource.data.assignedTo == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['agent', 'admin']);
    }
    
    // Agents can read all tickets assigned to them
    match /tickets/{ticketId} {
      allow read, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['agent', 'admin'];
    }
  }
}
```

Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

### Environment-Specific Configurations

#### Production Environment Variables
```bash
# Use production Firebase project
VITE_FIREBASE_PROJECT_ID=synapsolve-prod

# Use production OpenAI organization
VITE_OPENAI_API_KEY=sk-prod-...

# Production Neo4j instance
VITE_NEO4J_URI=neo4j+s://prod-instance.databases.neo4j.io
```

#### Staging Environment Variables
```bash
# Use staging Firebase project
VITE_FIREBASE_PROJECT_ID=synapsolve-staging

# Use development OpenAI key with lower limits
VITE_OPENAI_API_KEY=sk-dev-...

# Staging Neo4j instance
VITE_NEO4J_URI=neo4j+s://staging-instance.databases.neo4j.io
```

## 📊 Performance Optimization

### Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
```

### CDN Configuration
Add to `index.html` for better performance:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://api.openai.com">
<link rel="dns-prefetch" href="https://firestore.googleapis.com">
```

## 🔍 Monitoring & Analytics

### Error Tracking Setup
Add to your deployment:
```bash
# Install Sentry for error tracking
npm install @sentry/react @sentry/tracing
```

### Performance Monitoring
```typescript
// Add to main.tsx
import { initializeApp } from 'firebase/app';
import { getPerformance } from 'firebase/performance';

const app = initializeApp(firebaseConfig);
const perf = getPerformance(app);
```

### Analytics Setup
```typescript
// Add to main.tsx
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

#### Environment Variable Issues
```bash
# Verify environment variables are loaded
console.log('Environment check:', {
  firebase: !!import.meta.env.VITE_FIREBASE_API_KEY,
  openai: !!import.meta.env.VITE_OPENAI_API_KEY
});
```

#### Firebase Connection Issues
```bash
# Test Firebase connection
firebase projects:list
firebase use your-project-id
```

### Performance Issues
- Enable gzip compression on your hosting platform
- Use Firebase Performance Monitoring to identify bottlenecks
- Implement code splitting for large components
- Optimize images and use WebP format where possible

## 📈 Scaling Considerations

### Database Scaling
- Implement Firestore composite indexes for complex queries
- Use subcollections for large datasets
- Consider Firebase Functions for server-side processing

### API Rate Limiting
- Implement request caching for OpenAI API calls
- Use Firebase Functions to proxy API requests
- Add exponential backoff for failed requests

### CDN and Caching
- Configure proper cache headers for static assets
- Use Firebase Hosting CDN for global distribution
- Implement service worker for offline functionality

This deployment guide ensures your SynapSolve application is production-ready with proper security, performance optimization, and monitoring in place.