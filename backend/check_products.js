const db = require('./src/config/db');

async function check() {
  try {
    const [rows] = await db.query('SELECT id, name FROM products LIMIT 10');
    console.log('Products in DB:', rows);
    if (rows.length === 0) {
      console.log('WARNING: Products table is EMPTY. Wishlist/Cart functionality will fail due to foreign key constraints.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
