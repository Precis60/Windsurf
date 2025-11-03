import { query, closePool } from '../config/database.js';

async function migrateDatabase() {
  try {
    console.log('🔄 Running database migrations...');

    // Add client_type and notes columns to users table
    console.log('Adding client_type column to users table...');
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS client_type VARCHAR(50)`);
    console.log('✅ client_type column added');

    console.log('Adding notes column to users table...');
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT`);
    console.log('✅ notes column added');

    console.log('🎉 Database migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase().finally(async () => {
    await closePool();
  });
}

export default migrateDatabase;
