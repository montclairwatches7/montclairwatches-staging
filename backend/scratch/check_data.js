const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Montclair',
    port: process.env.DB_PORT || 3306
  });

  try {
    const [categories] = await connection.execute('SELECT id, name FROM categories');
    console.log('--- Categories ---');
    console.table(categories);

    const [products] = await connection.execute('SELECT id, name, category FROM products LIMIT 5');
    console.log('--- Products (Sample) ---');
    console.table(products);

    console.log('\nProducts with NULL category name (Join check):');
    const [orphans] = await connection.execute(`
      SELECT p.id, p.name, p.category 
      FROM products p 
      LEFT JOIN categories c ON p.category = c.id 
      WHERE c.name IS NULL
    `);
    console.table(orphans);

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
