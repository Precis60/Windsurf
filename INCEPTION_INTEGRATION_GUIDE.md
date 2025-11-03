# Inner Range Inception Integration Guide

## Overview
This guide explains how to integrate Inner Range Inception security system controls into your website, allowing users to arm/disarm areas directly from the web interface.

## Prerequisites

1. **Inner Range Inception Controller** with API access enabled
2. **API Credentials** (username and password)
3. **Network Access** to the Inception controller
4. **Area IDs** you want to control

## Setup Instructions

### 1. Configure Environment Variables

Create or update your `.env` file:

```env
# Inner Range Inception API Configuration
VITE_INCEPTION_API_URL=https://your-inception-controller-ip
VITE_INCEPTION_USERNAME=your_api_username
VITE_INCEPTION_PASSWORD=your_api_password
```

**Security Note**: Never commit the `.env` file to Git. It's already in `.gitignore`.

### 2. Enable Inception API on Your Controller

1. Log into your Inception controller web interface
2. Navigate to **System Settings** → **API Settings**
3. Enable **REST API**
4. Create an API user with appropriate permissions:
   - Area Control
   - Area Status
   - Session Management
5. Note the API endpoint URL (usually `https://controller-ip/api/v1`)

### 3. Add Security Control to Your Page

#### Option A: Add to Existing Page

```jsx
import SecurityControl from './components/SecurityControl';

function YourPage() {
  return (
    <div>
      <h1>Security System</h1>
      
      {/* Single area control */}
      <SecurityControl 
        areaId={1} 
        areaName="Main Office" 
      />
      
      {/* Multiple areas */}
      <SecurityControl 
        areaId={2} 
        areaName="Warehouse" 
      />
    </div>
  );
}
```

#### Option B: Create Dedicated Security Page

Create `/src/pages/Security.jsx`:

```jsx
import React from 'react';
import SecurityControl from '../components/SecurityControl';
import './Security.css';

const Security = () => {
  return (
    <div className="security-page">
      <h1>Security System Control</h1>
      
      <div className="security-grid">
        <SecurityControl areaId={1} areaName="Reception" />
        <SecurityControl areaId={2} areaName="Office Floor 1" />
        <SecurityControl areaId={3} areaName="Office Floor 2" />
        <SecurityControl areaId={4} areaName="Warehouse" />
      </div>
    </div>
  );
};

export default Security;
```

Add to your router in `App.jsx`:

```jsx
import Security from './pages/Security';

// In your routes:
<Route path="/security" element={<Security />} />
```

### 4. Find Your Area IDs

You can find area IDs in your Inception controller:

1. Log into Inception web interface
2. Go to **Areas** section
3. Note the ID number for each area
4. Or use the API to list all areas:

```bash
curl -X POST https://your-controller/api/v1/session \
  -H "Content-Type: application/json" \
  -d '{"username":"your_user","password":"your_pass"}'

# Use the session token to get areas:
curl https://your-controller/api/v1/areas \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Features

### Arm Modes

- **Arm Away**: Full arming (all sensors active)
- **Arm Stay**: Perimeter arming (motion sensors off)
- **Arm Night**: Night mode (selected sensors active)

### Security Features

- ✅ Real-time status updates (polls every 10 seconds)
- ✅ User code required for all actions
- ✅ Visual status indicators
- ✅ Error handling and user feedback
- ✅ Automatic session management
- ✅ Responsive design for mobile

### Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| Armed | Red | Area is fully armed |
| Disarmed | Green | Area is disarmed |
| Arming | Yellow | Area is in arming delay |
| Disarming | Yellow | Area is disarming |
| Alarm | Bright Red | Alarm is active |

## API Reference

### InceptionApiService Methods

```javascript
import inceptionApi from './services/inceptionApi';

// Get all areas
const areas = await inceptionApi.getAreas();

// Get area status
const status = await inceptionApi.getAreaStatus(1);

// Arm area
await inceptionApi.armArea(1, 'away', '1234');

// Disarm area
await inceptionApi.disarmArea(1, '1234');

// Get arm status
const armStatus = await inceptionApi.getArmStatus(1);

// Logout
await inceptionApi.logout();
```

## Security Considerations

### 1. HTTPS Required
Always use HTTPS for production to encrypt API credentials and user codes.

### 2. CORS Configuration
Configure your Inception controller to allow requests from your website domain:

```
Allowed Origins: https://yourdomain.com
```

### 3. User Code Handling
- User codes are never stored
- Codes are only sent over encrypted connections
- Codes are cleared from memory after use

### 4. Network Security
- Use VPN or secure network for API access
- Restrict API access to specific IP addresses if possible
- Use strong API credentials

### 5. User Permissions
- Only give access to authorized users
- Consider adding authentication to your website
- Log all arm/disarm actions

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to security system"

**Solutions**:
1. Check network connectivity to Inception controller
2. Verify API URL in `.env` file
3. Ensure API is enabled on controller
4. Check firewall rules

### Authentication Issues

**Problem**: "Authentication failed"

**Solutions**:
1. Verify username and password in `.env`
2. Check API user permissions on controller
3. Ensure API user is not locked out

### CORS Errors

**Problem**: "CORS policy blocked"

**Solutions**:
1. Add your domain to Inception's allowed origins
2. For development, you may need to disable CORS temporarily
3. Use a proxy server if needed

### Code Rejected

**Problem**: "Action failed. Check your code"

**Solutions**:
1. Verify the user code is correct
2. Check if user has permission for that area
3. Ensure area is in correct state for action

## Customization

### Change Button Colors

Edit `SecurityControl.css`:

```css
.security-btn.arm-away {
  background: linear-gradient(135deg, #your-color 0%, #your-darker-color 100%);
}
```

### Add Custom Actions

Extend `inceptionApi.js`:

```javascript
async customAction(areaId, action) {
  return await this.request(`/api/v1/areas/${areaId}/${action}`, {
    method: 'POST',
  });
}
```

### Modify Polling Interval

In `SecurityControl.jsx`, change:

```javascript
const interval = setInterval(loadStatus, 10000); // 10 seconds
```

## Production Deployment

### 1. Environment Variables

Set in your hosting platform (Netlify, Vercel, etc.):

```
VITE_INCEPTION_API_URL=https://your-controller
VITE_INCEPTION_USERNAME=production_user
VITE_INCEPTION_PASSWORD=secure_password
```

### 2. Build

```bash
npm run build
```

### 3. Deploy

The security controls will be included in your production build.

## Support

For Inception API documentation:
- Visit: https://www.innerrange.com/
- Contact Inner Range support
- Check Inception controller documentation

For integration issues:
- Check browser console for errors
- Review network tab for API calls
- Verify environment variables are set

## Example Implementation

See the complete working example in:
- `/src/services/inceptionApi.js` - API service
- `/src/components/SecurityControl.jsx` - React component
- `/src/components/SecurityControl.css` - Styling

---

**Last Updated**: November 2025  
**Version**: 1.0.0
