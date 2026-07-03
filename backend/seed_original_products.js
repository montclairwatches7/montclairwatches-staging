const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Montclair',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true, 
};

const originalProducts = [
  ['Heritage Chronograph Gold', 'Montclair', 120000, 150000, '/src/assets/watches/chronograph-gold.jpg', '["/src/assets/watches/chronograph-gold.jpg"]', 'classic', 'chronograph', 'leather', 'White', 1, 4.9, 47, 'MC-742-G', 'A testament to horological purity. Features a bespoke skeletonized movement housed within a single block of surgical-grade stainless steel.', 1, 1, '40mm / 11.2mm', 'Calibre H.01 Automatic', '10 ATM (100 Meters)', '72 Hours', 'Rose Gold 18K', 15],
  ['Deep Sea Diver Bronze', 'Montclair', 84000, 95000, '/src/assets/watches/diver-blue.jpg', '["/src/assets/watches/diver-blue.jpg"]', 'sport', 'diver', 'metal', 'Blue', 1, 4.8, 32, 'MC-310-S', 'Engineered for the depths. Ceramic unidirectional bezel with helium escape valve for professional diving.', 1, 0, '42mm / 13.5mm', 'Calibre M.55 Automatic', '300m / 1000ft', '60 Hours', 'Titanium Grade 5', 20],
  ['Monolith Skeleton', 'Montclair', 240000, null, '/src/assets/watches/skeleton-rose.jpg', '["/src/assets/watches/skeleton-rose.jpg"]', 'premium', 'heritage', 'leather', 'Skeleton', 1, 5.0, 18, 'MC-880-P', 'Hand-guilloché dial with hand-stitched alligator strap. Annual calendar complication with moonphase display.', 1, 1, '41mm / 10.8mm', 'Calibre M.900 Manual Wind', '5 ATM (50 Meters)', '96 Hours', 'Platinum 950', 5],
  ['Nocturne Stealth', 'Montclair', 18200, 22000, '/src/assets/watches/dress-grey.jpg', '["/src/assets/watches/dress-grey.jpg"]', 'classic', 'heritage', 'leather', 'Grey', 1, 4.7, 25, 'MC-102-S', 'PVD coating with sapphire exhibition back. A masterpiece of understated elegance.', 0, 0, '39mm / 9.5mm', 'Calibre M.102 Mechanical', '3 ATM (30 Meters)', '48 Hours', 'Polished Steel', 35],
  ['Apex Sport Chronograph', 'Montclair', 8500, 9800, '/src/assets/watches/sport-black.jpg', '["/src/assets/watches/sport-black.jpg"]', 'sport', 'chronograph', 'silicone', 'Black', 1, 4.6, 58, 'MC-455-T', 'Built for performance. Lightweight titanium case with ceramic bezel insert and rubber strap.', 0, 1, '44mm / 14.2mm', 'Calibre M.78 Automatic', '20 ATM (200 Meters)', '72 Hours', 'Titanium & Ceramic', 50],
  ['Celestial Moonphase III', 'Montclair', 35000, null, '/src/assets/watches/moonphase-blue.jpg', '["/src/assets/watches/moonphase-blue.jpg"]', 'premium', 'heritage', 'leather', 'Blue', 0, 5.0, 12, 'MC-800-R', 'Moonphase complication with hand-guilloché dial. Rose gold case with blue alligator strap.', 1, 0, '41mm / 12mm', 'Calibre M.800 Automatic', '5 ATM (50 Meters)', '80 Hours', 'Rose Gold 18K', 0]
];

async function runSeeder() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Deleting duplicate original products to prevent clutter...');
    await connection.query('DELETE FROM products WHERE name IN (?, ?, ?, ?, ?, ?)', ['Heritage Chronograph Gold', 'Deep Sea Diver Bronze', 'Monolith Skeleton', 'Nocturne Stealth', 'Apex Sport Chronograph', 'Celestial Moonphase III']);

    console.log('Inserting the original static product list...');
    
    await connection.query(`
      INSERT INTO products (
        name, brand, price, originalPrice, image, images, category, collection,
        strapType, dialColor, inStock, rating, reviewCount, reference, description,
        featured, trending, caseSize, movement, waterResistance, powerReserve, caseMaterial, stock_quantity
      ) VALUES ?
    `, [originalProducts]);

    console.log('Successfully added exact original products!');

  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeeder();
