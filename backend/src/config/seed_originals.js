const fs = require('fs');
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

const originalBanners = [
  ['Timeless Style, Modern Precision', 'Explore premium watches at best prices', '/hero-luxury-1.png', '/hero-luxury-1.png', 'Shop Now', '/collection', 'Explore Collection', '/collection', 'active', 1],
  ['Engineered Excellence', 'Mastering the Art of Mechanical Perfection', '/hero-luxury-2.png', '/hero-luxury-2.png', 'Shop Now', '/collection', 'View Technical Specs', '/collection', 'active', 2],
  ['The Heritage Legacy', 'A Testament to Horological Purity', '/hero-luxury-3.png', '/hero-luxury-3.png', 'Discover', '/collection', 'Our Story', '/about', 'active', 3]
];

const originalBrands = [
  ['Rolex', '/Rolex.png', 1, 'active'],
  ['Titan', '/titan.webp', 0, 'active'],
  ['Casio', '/Casio.avif', 0, 'active'],
  ['Timex', '/Timex.png', 0, 'active'],
  ['Fossil', '/Fossil.webp', 0, 'active'],
  ['Fastrack', '/Fastract.webp', 0, 'active']
];

const originalServices = [
  ['Free Shipping', 'On all orders above ₹5,000', 'Truck', 'active', 1],
  ['Secure Payment', '100% protected payments', 'Lock', 'active', 2],
  ['Easy Returns', '15-day return policy', 'RotateCcw', 'active', 3],
  ['24/7 Support', 'Dedicated expert help', 'Headphones', 'active', 4],
  ['Premium Quality', 'Certified authentic brands', 'Award', 'active', 5]
];

const originalTestimonials = [
  ['Arjun Sharma', 'The quality of the Montclair Heritage is beyond words. A truly premium experience from ordering to unboxing.', 5, 1, 'active'],
  ['Priya Patel', 'Finally found a place that offers authentic luxury watches with great customer service in India.', 5, 1, 'active'],
  ['Vikram Singh', 'The Smart watch I bought is sleek and functional. Delivery was super fast too!', 4, 1, 'active']
];

async function runSeeder() {
  let connection;
  try {
    console.log('Connecting to database specifically for original assets...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Truncating tables to clear random faker data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE banners');
    await connection.query('TRUNCATE TABLE brands');
    await connection.query('TRUNCATE TABLE services');
    await connection.query('TRUNCATE TABLE testimonials');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Inserting original exact contents...');
    
    await connection.query('INSERT INTO banners (title, subtitle, image_url, mobile_image_url, cta_1_text, cta_1_link, cta_2_text, cta_2_link, status, display_order) VALUES ?', [originalBanners]);
    await connection.query('INSERT INTO brands (name, logo_url, is_premium, status) VALUES ?', [originalBrands]);
    await connection.query('INSERT INTO services (title, description, icon_name, status, display_order) VALUES ?', [originalServices]);
    await connection.query('INSERT INTO testimonials (user_name, content, rating, is_verified_purchase, status) VALUES ?', [originalTestimonials]);

    console.log('Successfully reverted dynamic tables back to original static representations!');

  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeeder();
