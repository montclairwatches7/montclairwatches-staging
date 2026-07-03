const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({path: '../../.env'});

async function run() {
  const avatarsDir = path.join(__dirname, '../../frontend/public/avatars');
  if(!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, {recursive:true});
  }
  
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'Montclair',
  });
  
  const [users] = await c.query('SELECT id, name FROM users');
  for(const user of users) {
    const colors = ['FF5733','33FF57','3357FF','F033FF','33FFF0','FFB033', '1A1C29', 'B87333'];
    const bg = colors[user.id % colors.length];
    const initial = user.name ? user.name.charAt(0) : 'U';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#${bg}'/><text x='50' y='65' font-family='Arial' font-size='45' fill='white' text-anchor='middle'>${initial}</text></svg>`;
    const p = path.join(avatarsDir, 'user-'+user.id+'.svg');
    fs.writeFileSync(p, svg);
    await c.query('UPDATE users SET avatar = ? WHERE id = ?', ['/avatars/user-'+user.id+'.svg', user.id]);
  }
  console.log('Generated local avatars for ' + users.length + ' users!');

  // Now let's fix products string to local static watches images!
  const watchNames = [
    'chronograph-gold.jpg',
    'diver-blue.jpg',
    'dress-grey.jpg',
    'moonphase-blue.jpg',
    'skeleton-rose.jpg',
    'sport-black.jpg'
  ];
  
  const [products] = await c.query('SELECT id FROM products');
  for(let i=0; i<products.length; i++) {
    const p = products[i];
    const watchName = watchNames[i % watchNames.length];
    const localUrl = '/watches/' + watchName;
    const imagesJson = JSON.stringify([localUrl, localUrl, localUrl]);
    await c.query('UPDATE products SET image = ?, images = ? WHERE id = ?', [localUrl, imagesJson, p.id]);
  }
  console.log('Successfully re-mapped ' + products.length + ' products to local assets cache!');

  c.end();
}
run().catch(console.error);
