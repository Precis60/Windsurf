# Precision Cabling Automation - Business Website

A comprehensive business management platform for Precision Cabling Solutions, built with React and Vite.

🚀 **Latest Update**: Fixed calendar monthly, weekly, and daily views with complete CSS implementation.

## 🏗️ Architecture

- **Frontend**: React 19 + Vite + React Router
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: Supabase PostgreSQL (secure, scalable)
- **Authentication**: JWT-based with bcrypt password hashing
- **Deployment**: GitHub Pages (frontend) + Render (backend) + Supabase (database)

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
- Supabase PostgreSQL for high availability
- Encrypted connections (SSL/TLS)
- Automated backups and point-in-time recovery
- Connection pooling for serverless environments
- Optimized with indexes for performance
- Sample data for testing

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase Account (for database)
- Render Account (for backend hosting)
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

### 3. Setup Supabase Database

Follow the detailed guide in [`DATABASE_SETUP_INSTRUCTIONS.md`](DATABASE_SETUP_INSTRUCTIONS.md) to:
- Create Supabase project
- Get connection credentials
- Configure environment variables

### 4. Backend Setup

\`\`\`bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
# Or use individual variables:
# DB_HOST=aws-0-[region].pooler.supabase.com
# DB_PORT=6543
# DB_NAME=postgres
# DB_USER=postgres.[ref]
# DB_PASSWORD=your-password
# DB_SSL=true

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
- **Database Encryption**: SSL/TLS connections to Supabase

## 🚀 Deployment

### Frontend (GitHub Pages)
1. Build and deploy: `npm run deploy`
2. Site will be available at: `https://precis60.github.io/Windsurf/`
3. Automatic deployment via gh-pages package

### Backend (Render)
1. Connect GitHub repository to Render
2. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
3. Render will automatically deploy on git push
4. Backend URL: `https://precision-cabling-backend.onrender.com`

### Database (Supabase)
1. Create project at https://supabase.com
2. Copy connection pooling URL (Transaction mode)
3. Add to Render environment variables
4. Database automatically managed by Supabase

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
   - Check Supabase project is active (not paused)
   - Verify DATABASE_URL in Render environment variables
   - Ensure using connection pooling URL (port 6543)

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
