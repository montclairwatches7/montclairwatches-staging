const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend dir
dotenv.config({ path: path.join(__dirname, 'src', 'config', '..', '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
});

const db = pool.promise();

async function migrate() {
  try {
    console.log('Starting horological schema migration...');
    
    const columnsToAdd = [
      { name: 'model_number', type: 'VARCHAR(255) AFTER brand' },
      { name: 'mrp', type: 'DECIMAL(12, 2) AFTER collection' },
      { name: 'case_diameter', type: 'VARCHAR(100)' },
      { name: 'case_material', type: 'VARCHAR(255)' },
      { name: 'dial_colour', type: 'VARCHAR(100)' },
      { name: 'movement_type', type: 'VARCHAR(100)' },
      { name: 'caliber', type: 'VARCHAR(100)' },
      { name: 'water_resistance', type: 'VARCHAR(100)' },
      { name: 'strap_material', type: 'VARCHAR(255)' },
      { name: 'crystal', type: 'VARCHAR(255)' },
      { name: 'functions', type: 'TEXT' },
      { name: 'power_reserve', type: 'VARCHAR(100)' },
      { name: 'case_thickness', type: 'VARCHAR(100)' },
      { name: 'lug_width', type: 'VARCHAR(100)' },
      { name: 'warranty', type: 'VARCHAR(255)' },
      { name: 'key_highlights', type: 'TEXT' },
      { name: 'whats_in_the_box', type: 'TEXT' }
    ];

    for (const col of columnsToAdd) {
      try {
        await db.query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
        console.log(`[SUCCESS] Added column: ${col.name}`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`[SKIP] Column already exists: ${col.name}`);
        } else {
          console.error(`[ERROR] Adding ${col.name}:`, e.message);
        }
      }
    }

    // Ensure price is decimal
    try {
      await db.query(`ALTER TABLE products MODIFY COLUMN price DECIMAL(12, 2)`);
      console.log(`[SUCCESS] Verified price column type`);
    } catch (e) {
      console.error(`[ERROR] Modifying price:`, e.message);
    }

    console.log('Migration sequence completed.');
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL: Migration failed:', err);
    process.exit(1);
  }
}

migrate();
