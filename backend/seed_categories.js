const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const c = await mysql.createConnection({host:'localhost',user:'root',database:'Montclair'});
  try {
    await c.query('ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) DEFAULT NULL');
  } catch(e) {
    console.log("Column might already exist", e.message);
  }
  await c.query('SET FOREIGN_KEY_CHECKS = 0');
  await c.query('TRUNCATE TABLE categories');
  await c.query('SET FOREIGN_KEY_CHECKS = 1');
  
  const cats = [
    ["Men Watches", "/cat-men.png"],
    ["Women Watches", "/cat-women.png"],
    ["Smart Watches", "/cat-smart.png"],
    ["Luxury Watches", "/cat-luxury.png"],
    ["Sports Watches", "/cat-sport.png"]
  ];
  
  await c.query('INSERT INTO categories (name, image_url) VALUES ?', [cats]);
  console.log('Categories updated!');
  c.end();
}
run();
