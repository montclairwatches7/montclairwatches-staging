const db = require('./src/config/db');

async function migrate() {
  try {
    console.log('Starting profile migration...');
    
    // Check if phone column exists
    const [columns] = await db.query('SHOW COLUMNS FROM users LIKE "phone"');
    if (columns.length === 0) {
      console.log('Adding phone column...');
      await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
    }

    // Create addresses table
    console.log('Ensuring addresses table exists...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(255),
        street VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        zip VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        phone VARCHAR(20),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
