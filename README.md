# Precision Cabling Automation - Business Website

A comprehensive business management platform for Precision Cabling Solutions, built with React and Vite.

🚀 **Latest Update**: Fixed calendar monthly, weekly, and daily views with complete CSS implementation.

## 🏗️ Architecture

- **Frontend**: React 19 + Vite + React Router
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: AWS RDS PostgreSQL (secure, scalable)
- **Authentication**: JWT-based with bcrypt password hashing
- **Deployment**: Netlify (frontend) + AWS (backend & database)

## 🚀 Features

### Frontend
- Modern React application with responsive design
- User authentication (login/register)
- Protected routes and role-based access
- Dashboard with real-time data
- Calendar integration
- Customer management
- Support portal
- Project tracking

### Backend API
- RESTful API with Express.js
- Secure authentication with JWT
- Role-based access control (customer, staff, admin)
- Input validation and sanitization
- Rate limiting and security headers
- Comprehensive error handling
- PostgreSQL database integration

### Database
- AWS RDS PostgreSQL for high availability
- Encrypted connections (SSL/TLS)
- Automated backups and point-in-time recovery
- Optimized with indexes for performance
- Sample data for testing

## 📋 Prerequisites

- Node.js 18+ and npm
- AWS Account (for RDS database)
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/Precis60/Windsurf.git
cd Windsurf
\`\`\`

### 2. Install Node.js (if not installed)

**macOS (using Homebrew):**
\`\`\`bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
\`\`\`

**Other platforms:**
- Download from [nodejs.org](https://nodejs.org/)

### 3. Setup AWS RDS Database

Follow the detailed guide in [`backend/AWS_RDS_SETUP.md`](backend/AWS_RDS_SETUP.md) to:
- Create PostgreSQL RDS instance
- Configure security groups
- Get connection credentials

### 4. Backend Setup

\`\`\`bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your AWS RDS credentials
# DB_HOST=your-rds-endpoint.amazonaws.com
# DB_USER=your-username
# DB_PASSWORD=your-password
# etc.

# Setup database tables and sample data
npm run setup-db

# Start development server
npm run dev
\`\`\`

The backend will run on `http://localhost:3001`

### 5. Frontend Setup

\`\`\`bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
\`\`\`

The frontend will run on `http://localhost:5173`

## 🔐 Demo Accounts

After running the database setup, you can use these accounts:

**Administrator:**
- Email: `admin@precisioncabling.com`
- Password: `Admin123!`

**Customer:**
- Email: `customer@example.com`
- Password: `Customer123!`

⚠️ **Change these passwords in production!**

## 🗂️ Project Structure

\`\`\`
Windsurf/
├── src/                          # Frontend React application
│   ├── components/               # Reusable React components
│   │   ├── Auth.jsx             # Login/Register components
│   │   ├── Dashboard.jsx        # User dashboard
│   │   └── *.css               # Component styles
│   ├── pages/                   # Page components
│   ├── services/                # API service layer
│   │   ├── api.js              # Base API configuration
│   │   └── index.js            # Service functions
│   └── assets/                  # Static assets
├── backend/                     # Node.js backend API
│   ├── config/                  # Configuration files
│   │   └── database.js         # Database connection
│   ├── middleware/              # Express middleware
│   │   └── auth.js             # Authentication middleware
│   ├── routes/                  # API route handlers
│   │   ├── auth.js             # Authentication routes
│   │   ├── customers.js        # Customer management
│   │   ├── appointments.js     # Appointment scheduling
│   │   ├── projects.js         # Project management
│   │   └── support.js          # Support tickets
│   ├── scripts/                 # Utility scripts
│   │   └── setup-database.js   # Database initialization
│   ├── server.js               # Express server entry point
│   └── AWS_RDS_SETUP.md        # Database setup guide
├── public/                      # Static files
├── package.json                # Frontend dependencies
└── README.md                   # This file
\`\`\`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Customers
- `GET /api/customers` - List customers (admin/staff)
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (admin)

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (staff/admin)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (admin)

### Support
- `GET /api/support` - List support tickets
- `POST /api/support` - Create support ticket
- `GET /api/support/:id` - Get ticket details
- `POST /api/support/:id/responses` - Add response
- `PUT /api/support/:id` - Update ticket (staff/admin)

## 🔒 Security Features

- **Authentication**: JWT tokens with secure expiration
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: express-validator for all inputs
- **Rate Limiting**: Prevents brute force attacks
- **CORS Protection**: Configurable cross-origin policies
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Helmet.js security headers
- **Database Encryption**: SSL/TLS connections to AWS RDS

## 🚀 Deployment

### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Backend (AWS/Heroku/DigitalOcean)
1. Deploy to your preferred platform
2. Set environment variables
3. Run database migrations
4. Configure domain and SSL

## 🧪 Development

### Running Tests
\`\`\`bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ..
npm test
\`\`\`

### Code Style
- ESLint configuration included
- Prettier formatting recommended
- Pre-commit hooks for code quality

## 📈 Performance

- Database indexing for optimal queries
- Connection pooling for database efficiency
- Frontend code splitting with Vite
- Image optimization and lazy loading
- Caching strategies for API responses

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check AWS RDS security group settings
   - Verify credentials in .env file
   - Ensure RDS instance is running

2. **Authentication Errors**
   - Check JWT_SECRET is set
   - Verify token expiration settings
   - Clear browser localStorage

3. **CORS Issues**
   - Update CORS_ORIGIN in backend .env
   - Check frontend API URL configuration

### Support

For technical support or questions:
- Email: jamie@projectconsultants.org
- Phone: 0413 729 663

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary software for Precision Cabling & Automation.

---

**Built with ❤️ for Precision Cabling & Automation**
