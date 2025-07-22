# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.local` file with:
```
N8N_WEBHOOK_URL=http://your-n8n-server.com/webhook/chat
```

### 2. Video File
Ensure `background-video.mp4` is in the `public/` folder.

### 3. Build & Deploy
```bash
npm run build
npm start
```

## 🔧 Production Fixes Applied

### ✅ Critical Issues Fixed:
- **Removed console logs** from production code
- **Added input validation** to prevent malicious requests
- **Added proper error handling** for video loading
- **Made webhook URL configurable** via environment variables
- **Enhanced error messages** for better user experience

### ⚠️ Remaining Considerations:

#### Security:
- Consider adding rate limiting for production
- Implement proper CORS if needed
- Add request size limits

#### Performance:
- Optimize video file size for faster loading
- Consider lazy loading for video
- Add loading states for PDF links

#### Accessibility:
- Add ARIA labels for screen readers
- Ensure keyboard navigation works
- Consider video autoplay preferences

#### Monitoring:
- Set up error tracking (Sentry, etc.)
- Monitor webhook response times
- Add health check endpoints

## 🐛 Known Limitations:
- No rate limiting implemented
- Video autoplay may be blocked by browsers
- No offline support
- Session data stored in localStorage only

## 📝 Deployment Notes:
- The app is now production-ready with proper error handling
- Console logs have been removed for cleaner production logs
- Input validation prevents common attack vectors
- Environment variables allow flexible webhook configuration 