# 🚀 Render Deployment Guide
## Precision Cabling & Automation

This guide provides step-by-step instructions for deploying the application using Render.

## 📋 Quick Setup (15 minutes)

1. Backend & Database Setup (10 minutes)
2. Environment Configuration (3 minutes)
3. Testing (2 minutes)

---

## 🔥 Step 1: Backend & Database Setup

### Create PostgreSQL Database

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure the database:
   - **Name**: `precision-cabling-db`
   - **Database**: `precision_cabling`
   - **User**: Let Render generate this
   - **Region**: Choose closest to you
4. Click **"Create Database"**
5. Save the connection details shown:
   - Database URL
   - Internal Database URL
   - External Database URL

### Deploy Backend Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect to your GitHub repository: `Precis60/Windsurf`
3. Configure the service:
   - **Name**: `precision-cabling-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Choose based on your needs
4. Click **"Create Web Service"**

---

## ⚙️ Step 2: Environment Configuration

### Set Environment Variables in Render

In your Web Service's dashboard, go to **"Environment"** → **"Add Environment Variable"**:

```bash
NODE_ENV=production
PORT=3001

# Database (use Internal Database URL from Render)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Security
JWT_SECRET=your-secure-jwt-secret  # Generate this securely
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=https://precis60.github.io
```

### Generate Secure JWT Secret

Use this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🧪 Step 3: Testing

### Backend Health Check
- Visit: `https://[your-backend-url]/health`
- Expected response: `{"status":"OK","message":"API is running"}`

### Database Connection
- Check Render logs for successful database connection
- Verify tables are created on first startup

### Authentication Test
1. Visit the frontend: `https://precis60.github.io/Windsurf/`
2. Try logging in with test credentials
3. Verify JWT token is received

---

## 🔐 Security Features

- ✅ Render's built-in SSL/TLS encryption
- ✅ Secure database connection
- ✅ Environment variable protection
- ✅ JWT authentication
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Secure headers (Helmet.js)

---

## 📞 Troubleshooting

### Common Issues

1. **Database Connection Fails**
   - Check DATABASE_URL is correct
   - Verify database is running in Render
   - Check Render logs for connection errors

2. **Backend Won't Start**
   - Verify all environment variables are set
   - Check build logs for errors
   - Ensure start command is correct

3. **CORS Errors**
   - Verify CORS_ORIGIN matches your frontend URL exactly
   - Check for trailing slashes
   - Ensure protocol (https://) is correct

### Getting Help

1. Check Render logs for detailed error messages
2. Review service metrics in Render dashboard
3. Use Render's built-in shell access for debugging

---

## 🔄 Updates and Maintenance

### Deploying Updates

1. Push changes to your GitHub repository
2. Render will automatically deploy updates
3. Monitor deployment in Render dashboard

### Monitoring

- Use Render's built-in metrics
- Check application logs regularly
- Monitor database performance

---

## 📚 Next Steps

1. Set up automatic database backups in Render
2. Configure custom domain (optional)
3. Set up monitoring alerts
4. Scale resources as needed

For any questions or issues, refer to [Render's documentation](https://render.com/docs) or contact the development team.
