const db = require('./src/config/db');

async function migrate() {
  try {
    console.log('Starting users enhancement migration...');
    
    // Add last_login column
    const [columns] = await db.query('SHOW COLUMNS FROM users LIKE "last_login"');
    if (columns.length === 0) {
      console.log('Adding last_login column...');
      await db.query('ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
