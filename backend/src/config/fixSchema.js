const db = require('./db');

const fixSchema = async () => {
  try {
    console.log('Adding missing columns to Railway database...');

    // Users table
    try {
      await db.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255) AFTER phone');
      console.log('Added avatar to users');
    } catch (e) { console.log('Avatar column might already exist or users table missing'); }

    // Products table
    try {
      await db.query('ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0');
      console.log('Added stock_quantity to products');
    } catch (e) { console.log('stock_quantity column might already exist'); }

    // Orders table
    try {
      await db.query('ALTER TABLE orders ADD COLUMN payment_id VARCHAR(100)');
      await db.query('ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100)');
      // Update status enum if needed
      await db.query("ALTER TABLE orders MODIFY COLUMN status ENUM('payment_pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'payment_pending'");
      console.log('Updated orders table');
    } catch (e) { console.log('Orders table updates failed or already applied'); }

    console.log('Schema fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing schema:', error);
    process.exit(1);
  }
};

fixSchema();
