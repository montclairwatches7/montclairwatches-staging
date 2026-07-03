const db = require('./src/config/db');

async function fix() {
  try {
    const [columns] = await db.query('SHOW COLUMNS FROM products');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('created_at')) {
      console.log('Adding created_at column...');
      await db.query('ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('created_at added.');
    } else {
      console.log('created_at already exists.');
    }

    if (!columnNames.includes('status')) {
       console.log('Adding status column...');
       await db.query("ALTER TABLE products ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
    }

    if (!columnNames.includes('stock_quantity')) {
       console.log('Adding stock_quantity column...');
       await db.query("ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0");
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
