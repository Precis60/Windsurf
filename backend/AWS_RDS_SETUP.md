# AWS RDS PostgreSQL Database Setup Guide

This guide will help you set up an Amazon RDS PostgreSQL database for the Precision Cabling & Automation application.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured (optional but recommended)

## Step 1: Create RDS PostgreSQL Instance

### Using AWS Console:

1. **Log in to AWS Console** and navigate to RDS service
2. **Create Database**:
   - Choose "Standard Create"
   - Engine: PostgreSQL
   - Version: PostgreSQL 14 or later (recommended)
   - Templates: "Free tier" (for testing) or "Production" (for live use)

3. **Database Settings**:
   - DB instance identifier: `precision-cabling-db`
   - Master username: `dbadmin` (or your preferred username)
   - Master password: Generate a secure password and save it

4. **Instance Configuration**:
   - DB instance class: `db.t3.micro` (free tier) or larger for production
   - Storage type: General Purpose SSD (gp2)
   - Allocated storage: 20 GB minimum

5. **Connectivity**:
   - VPC: Default VPC (or your custom VPC)
   - Public access: Yes (for development) or No (for production with VPN/bastion)
   - VPC security groups: Create new or use existing
   - Availability Zone: No preference
   - Database port: 5432 (default)

6. **Additional Configuration**:
   - Initial database name: `precision_cabling_db`
   - Backup retention: 7 days
   - Enable automated backups
   - Monitoring: Enable Enhanced monitoring (optional)

### Using AWS CLI:

\`\`\`bash
aws rds create-db-instance \\
    --db-instance-identifier precision-cabling-db \\
    --db-instance-class db.t3.micro \\
    --engine postgres \\
    --master-username dbadmin \\
    --master-user-password YOUR_SECURE_PASSWORD \\
    --allocated-storage 20 \\
    --db-name precision_cabling_db \\
    --vpc-security-group-ids sg-xxxxxxxx \\
    --backup-retention-period 7 \\
    --storage-encrypted \\
    --multi-az \\
    --publicly-accessible
\`\`\`

## Step 2: Configure Security Groups

1. **Find your RDS security group** in EC2 console
2. **Add inbound rule**:
   - Type: PostgreSQL
   - Protocol: TCP
   - Port: 5432
   - Source: Your IP address (for development) or application security group

## Step 3: Get Connection Details

After the RDS instance is created (takes 5-10 minutes):

1. **Go to RDS Console** → Databases → Your instance
2. **Copy the Endpoint** (looks like: `precision-cabling-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`)
3. **Note the Port** (usually 5432)

## Step 4: Configure Environment Variables

1. **Copy the environment file**:
   \`\`\`bash
   cd backend
   cp .env.example .env
   \`\`\`

2. **Update `.env` file** with your RDS details:
   \`\`\`env
   NODE_ENV=development
   PORT=3001

   # Database Configuration
   DB_HOST=your-rds-endpoint.xxxxxxxxx.us-east-1.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=precision_cabling_db
   DB_USER=dbadmin
   DB_PASSWORD=your-secure-password
   DB_SSL=true

   # JWT Secret (Generate a secure random string)
   JWT_SECRET=your-super-secure-jwt-secret-key-here

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   \`\`\`

## Step 5: Install Dependencies and Setup Database

1. **Install backend dependencies**:
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Run database setup script**:
   \`\`\`bash
   npm run setup-db
   \`\`\`

   This will create all necessary tables and sample data.

## Step 6: Start the Backend Server

\`\`\`bash
npm run dev
\`\`\`

The server should start on port 3001 and connect to your RDS database.

## Step 7: Test Database Connection

Visit `http://localhost:3001/health` - you should see a success response indicating the API is running.

## Security Best Practices

### For Production:

1. **Private Subnets**: Place RDS in private subnets
2. **Security Groups**: Restrict access to application servers only
3. **SSL/TLS**: Always use encrypted connections
4. **Secrets Manager**: Store database credentials in AWS Secrets Manager
5. **IAM Database Authentication**: Use IAM roles instead of passwords
6. **Backup Strategy**: Configure automated backups and point-in-time recovery
7. **Monitoring**: Set up CloudWatch alarms for database metrics

### Environment Variables for Production:

\`\`\`env
NODE_ENV=production
DB_SSL=true
# Use AWS Secrets Manager or Parameter Store for sensitive values
\`\`\`

## Connecting from Frontend

The React frontend will connect to your backend API at `http://localhost:3001/api/*` endpoints. The backend handles all database interactions securely.

## Troubleshooting

### Common Issues:

1. **Connection timeout**: Check security group rules
2. **Authentication failed**: Verify username/password
3. **Database does not exist**: Ensure the initial database name is correct
4. **SSL errors**: Make sure `DB_SSL=true` for RDS connections

### Testing Connection:

You can test the database connection using psql:

\`\`\`bash
psql -h your-rds-endpoint.amazonaws.com -p 5432 -U dbadmin -d precision_cabling_db
\`\`\`

## Cost Optimization

- Use `db.t3.micro` for development (free tier eligible)
- Enable storage autoscaling
- Set appropriate backup retention period
- Use Reserved Instances for production workloads
- Monitor and optimize using AWS Cost Explorer

## Next Steps

1. Set up your RDS instance following this guide
2. Configure your environment variables
3. Run the database setup script
4. Start developing your application with a secure, scalable database backend

For any issues, check the AWS RDS documentation or the application logs for more details.
