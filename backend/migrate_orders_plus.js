const db = require('./src/config/db');

async function migrate() {
  try {
    console.log('Enhancing Orders table...');
    
    // Update ENUM for status (MySQL requires re-defining the column)
    await db.query(`
      ALTER TABLE orders MODIFY COLUMN status ENUM('processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded') DEFAULT 'processing'
    `);

    // Add tracking number and cancel_reason
    const [columns] = await db.query('SHOW COLUMNS FROM orders LIKE "tracking_number"');
    if (columns.length === 0) {
      await db.query('ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100), ADD COLUMN cancel_reason TEXT');
    }

    console.log('Orders migration completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
