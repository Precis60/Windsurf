# Production Deployment Guide

## Overview
This application is configured for production deployment with the following architecture:
- **Frontend**: React + Vite deployed on GitHub Pages
- **Backend**: Node.js + PostgreSQL deployed on Render
- **Live URL**: https://precis60.github.io/Windsurf/

## Production Configuration

### Backend API
- **URL**: https://precision-cabling-backend.onrender.com/api
- **Database**: PostgreSQL on Render
- **Authentication**: JWT tokens with secure HTTP-only cookies

### Frontend Deployment
- **Platform**: GitHub Pages
- **Auto-deployment**: Enabled via GitHub Actions
- **Trigger**: Push to `main` branch

## Environment Variables

### Required GitHub Secrets
Set these in your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **VITE_GOOGLE_MAPS_API_KEY**
   - Your Google Maps API key for address autocomplete
   - Get it from: https://console.cloud.google.com/
   - Enable: Maps JavaScript API and Places API

### Local Development
Create a `.env` file in the root directory:

```env
VITE_API_URL=https://precision-cabling-backend.onrender.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Deployment Process

### Automatic Deployment (Recommended)
1. Make your changes locally
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. GitHub Actions will automatically:
   - Install dependencies
   - Build the production bundle
   - Deploy to GitHub Pages
4. Check deployment status at: https://github.com/Precis60/Windsurf/actions

### Manual Deployment
If you need to deploy manually:

```bash
# Build the production bundle
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Production Checklist

### Before Deploying
- [ ] All demo code removed ✅
- [ ] Environment variables configured
- [ ] Backend API is live and accessible
- [ ] Database migrations completed
- [ ] SSL/HTTPS enabled
- [ ] CORS configured for GitHub Pages domain

### After Deploying
- [ ] Test login functionality
- [ ] Verify calendar management works
- [ ] Check CRM customer operations
- [ ] Test appointment creation/editing
- [ ] Verify all API endpoints respond correctly
- [ ] Check browser console for errors
- [ ] Test on mobile devices

## Monitoring & Maintenance

### Backend Health Check
Check backend status: https://precision-cabling-backend.onrender.com/health

### Common Issues

**Issue**: "Invalid or expired token" error
- **Solution**: Clear browser localStorage and login again
- **Prevention**: Ensure backend JWT_SECRET is set correctly

**Issue**: API requests failing
- **Solution**: Check backend is running on Render
- **Note**: Free tier backends may sleep after inactivity (takes ~30s to wake)

**Issue**: Address autocomplete not working
- **Solution**: Verify VITE_GOOGLE_MAPS_API_KEY is set in GitHub Secrets
- **Check**: API key has correct restrictions and enabled APIs

## Security Notes

### Production Security Features
- ✅ JWT authentication with secure tokens
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention via parameterized queries
- ✅ CORS configured for specific origins
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced on all connections

### Best Practices
1. **Never commit** `.env` files to Git
2. **Rotate secrets** regularly (JWT_SECRET, API keys)
3. **Monitor** backend logs for suspicious activity
4. **Update** dependencies regularly for security patches
5. **Backup** database regularly

## Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading for routes
- Optimized bundle size
- CDN delivery via GitHub Pages

### Backend
- Connection pooling for PostgreSQL
- Indexed database queries
- Rate limiting on API endpoints
- Gzip compression enabled

## Support & Troubleshooting

### Logs
- **Frontend**: Browser DevTools Console
- **Backend**: Render dashboard logs
- **GitHub Actions**: Actions tab in repository

### Contact
For issues or questions, check:
1. Backend logs on Render
2. GitHub Actions workflow logs
3. Browser console errors

## Version Information
- **Node.js**: 18.x
- **React**: 19.1.0
- **Vite**: 7.0.4
- **Backend**: Express.js with PostgreSQL

---

**Last Updated**: November 2025
**Status**: ✅ Production Ready - All demo code removed
