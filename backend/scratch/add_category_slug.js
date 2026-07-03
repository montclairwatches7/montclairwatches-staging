const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Montclair',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Adding slug column to categories...');
    await connection.execute(`
      ALTER TABLE categories 
      ADD COLUMN slug VARCHAR(255) UNIQUE AFTER name
    `);

    const [categories] = await connection.execute('SELECT id, name FROM categories');
    
    for (const cat of categories) {
      const slug = cat.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      await connection.execute('UPDATE categories SET slug = ? WHERE id = ?', [slug, cat.id]);
      console.log(`Generated slug for ${cat.name}: ${slug}`);
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
