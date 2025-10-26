# Database Setup Instructions for Precision Cabling Website

## Current Status
❌ **Database is NOT connected** - The backend service on Render needs database configuration.
✅ **Backend service is running** - https://precision-cabling-backend.onrender.com
✅ **Frontend is configured** - Ready to connect to live backend (DEMO_MODE disabled)

## Issue
The backend is returning "Tenant or user not found" errors because the PostgreSQL database environment variables are not configured on Render.

---

## Solution: Configure Render PostgreSQL Database

### Step 1: Access Your Render Dashboard
1. Go to https://dashboard.render.com/
2. Log in to your account

### Step 2: Check for Existing PostgreSQL Database
1. Look in your dashboard for a PostgreSQL database service
2. If you see one named `precision-cabling-db` or similar, note its details
3. If you DON'T have a database, create one:
   - Click **"New +"** → **"PostgreSQL"**
   - Name: `precision-cabling-db`
   - Database: `precision_cabling_production`
   - Region: **Oregon (US West)** (same as backend)
   - Plan: **Free** (for testing) or **Starter $7/month** (for production)
   - Click **"Create Database"**
   - Wait 2-3 minutes for creation

### Step 3: Get Database Connection Details
1. Click on your PostgreSQL database service
2. Scroll to **"Connections"** section
3. You'll see two connection strings:
   - **Internal Database URL** (use this one - faster, free bandwidth)
   - **External Database URL** (for external tools)

4. Note these individual values (shown in the "Connection Details" section):
   ```
   Host: dpg-xxxxxxxxxxxxx-a.oregon-postgres.render.com
   Port: 5432
   Database: precision_cabling_production
   Username: precision_cabling_db_user (or similar)
   Password: xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 4: Configure Backend Environment Variables
1. Go back to your Render dashboard
2. Find your backend service: `precision-cabling-backend`
3. Click on it to open
4. Go to **"Environment"** tab on the left
5. Add/Update these environment variables (click "Add Environment Variable" for each):

```
NODE_ENV=production
PORT=3001

# Database Configuration - Use values from Step 3
DB_HOST=dpg-xxxxxxxxxxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=precision_cabling_production
DB_USER=precision_cabling_db_user
DB_PASSWORD=your-actual-password-from-render
DB_SSL=true

# JWT Configuration
JWT_SECRET=generate-a-secure-random-64-character-string-here-use-password-generator
JWT_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=https://precis60.github.io

# Optional: Admin Reset Token (for emergency admin reset)
ADMIN_RESET_TOKEN=another-secure-random-string
```

**Important Notes:**
- Replace the `DB_HOST`, `DB_USER`, `DB_PASSWORD` with actual values from your database
- For `JWT_SECRET`, generate a secure random string (64+ characters). You can use: https://www.random.org/strings/
- Save all changes

6. Click **"Save Changes"**
7. Render will automatically redeploy your backend (takes 2-3 minutes)

### Step 5: Wait for Backend to Redeploy
1. Watch the "Events" tab on your backend service
2. Wait for "Deploy succeeded" message
3. This usually takes 2-3 minutes

### Step 6: Initialize the Database
Once the backend has redeployed, run these commands in your terminal:

```bash
# Test backend is running
curl https://precision-cabling-backend.onrender.com/health

# Initialize database tables and create admin user
curl -X POST https://precision-cabling-backend.onrender.com/api/emergency-admin-reset

# Verify admin user was created
curl https://precision-cabling-backend.onrender.com/api/check-admin
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Admin account reset successfully",
  "email": "admin@precisioncabling.com",
  "password": "Admin123!"
}
```

### Step 7: Test Login
```bash
curl -X POST https://precision-cabling-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@precisioncabling.com","password":"Admin123!"}'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@precisioncabling.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 8: Deploy Frontend
Once the backend is working, deploy the updated frontend:

```bash
cd /Users/precis60/Documents/GitHub/Windsurf
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run deploy
```

---

## Troubleshooting

### Issue: "Tenant or user not found"
**Cause:** Database environment variables not set or incorrect
**Solution:** Double-check DB_HOST, DB_USER, DB_PASSWORD in Step 4

### Issue: "Connection timeout"
**Cause:** Database not created or wrong region
**Solution:** Ensure database exists and is in same region as backend

### Issue: Backend returns 502 Bad Gateway
**Cause:** Service is sleeping (free tier) or starting up
**Solution:** Wait 10-30 seconds and try again. Free tier services sleep after inactivity.

### Issue: Login still fails after setup
**Cause:** Database tables not initialized
**Solution:** Run the emergency-admin-reset endpoint again (Step 6)

---

## Verification Checklist

- [ ] PostgreSQL database created on Render
- [ ] Database connection details copied
- [ ] Backend environment variables configured
- [ ] Backend redeployed successfully
- [ ] Database initialized (admin user created)
- [ ] Login test successful
- [ ] Frontend deployed with DEMO_MODE=false

---

## Default Login Credentials

After setup, use these credentials to log in:
- **Email:** admin@precisioncabling.com
- **Password:** Admin123!

⚠️ **IMPORTANT:** Change the default password after first login!

---

## Need Help?

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs tab
2. Verify environment variables are set correctly
3. Ensure database and backend are in the same region
4. Check that DB_SSL=true for Render PostgreSQL

---

## Summary

Your website is configured to use a live PostgreSQL database. Once you complete the steps above:
- ✅ All data will be stored in the database (not localStorage)
- ✅ Data persists across devices and sessions
- ✅ Multiple users can access the same data
- ✅ Professional, production-ready setup
