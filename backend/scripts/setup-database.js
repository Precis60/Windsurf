import { query, closePool } from '../config/database.js';
import bcrypt from 'bcrypt';

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database tables...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(255),
        address TEXT,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
        is_active BOOLEAN DEFAULT true, -- Use this for soft-delete
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);

    // Create projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
        budget DECIMAL(12,2),
        start_date DATE,
        end_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create appointments table
    await query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        appointment_date TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure address columns exist on appointments (idempotent migrations)
    await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS address TEXT`);
    await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS address_place_id VARCHAR(255)`);
    await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS address_lat DOUBLE PRECISION`);
    await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS address_lng DOUBLE PRECISION`);
    await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS address_components JSONB`);

    // Create support_tickets table
    await query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        category VARCHAR(30) DEFAULT 'general' CHECK (category IN ('technical', 'billing', 'general', 'feature_request')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `);

    // Create support_responses table
    await query(`
      CREATE TABLE IF NOT EXISTS support_responses (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_by_staff BOOLEAN DEFAULT false,
        staff_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await query('CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)');
    await query('CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_id ON support_tickets(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_support_responses_ticket_id ON support_responses(ticket_id)');

    // Create appointment_requests table for tentative appointments
    await query(`
      CREATE TABLE IF NOT EXISTS appointment_requests (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        requested_date TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
        address TEXT,
        address_place_id VARCHAR(255),
        address_lat DOUBLE PRECISION,
        address_lng DOUBLE PRECISION,
        address_components JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_appointment_requests_customer_id ON appointment_requests(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_appointment_requests_requested_date ON appointment_requests(requested_date)');

    console.log('✅ Database tables created successfully');

    // Create default admin user
    const adminEmail = 'admin@precisioncabling.com';
    const adminPassword = 'Admin123!'; // Change this in production
    
    const existingAdmin = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [adminEmail, hashedPassword, 'System', 'Administrator', 'admin', '0413729663']);
      
      console.log('✅ Default admin user created');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample customer for testing
    const customerEmail = 'customer@example.com';
    const customerPassword = 'Customer123!';
    
    const existingCustomer = await query('SELECT id FROM users WHERE email = $1', [customerEmail]);
    
    if (existingCustomer.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(customerPassword, 12);
      
      const customerResult = await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone, company)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [customerEmail, hashedPassword, 'Test', 'Customer', 'customer', '0412345678', 'Test Company Pty Ltd']);
      
      const customerId = customerResult.rows[0].id;
      
      // Create sample project
      await query(`
        INSERT INTO projects (customer_id, name, description, status, budget, start_date)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [customerId, 'Office Network Installation', 'Complete network cabling and setup for new office building', 'planning', 15000.00, new Date()]);
      
      // Create sample appointment
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 7); // Next week
      
      await query(`
        INSERT INTO appointments (customer_id, title, description, appointment_date, duration_minutes)
        VALUES ($1, $2, $3, $4, $5)
      `, [customerId, 'Site Survey', 'Initial site survey and requirements gathering', appointmentDate, 120]);
      
      console.log('✅ Sample customer and data created');
      console.log(`📧 Customer Email: ${customerEmail}`);
      console.log(`🔑 Customer Password: ${customerPassword}`);
    } else {
      console.log('ℹ️  Sample customer already exists');
    }

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export default setupDatabase;
