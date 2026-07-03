const db = require('./src/config/db');

async function seed() {
  try {
    console.log('Seeding products to match frontend IDs...');
    
    // Disable foreign key checks for clearing
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE products');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    const products = [
      { id: 1, name: 'Heritage Chronograph Gold', price: 12400, category: 'classic', collection: 'chronograph', strapType: 'leather', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80' },
      { id: 2, name: 'Deep Sea Diver Bronze', price: 9800, category: 'sport', collection: 'diver', strapType: 'metal', image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80' },
      { id: 3, name: 'Monolith Skeleton', price: 18900, category: 'premium', collection: 'heritage', strapType: 'leather', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
      { id: 4, name: 'Nocturne Stealth', price: 18200, category: 'classic', collection: 'heritage', strapType: 'leather', image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80' },
      { id: 5, name: 'Apex Sport Chronograph', price: 8500, category: 'sport', collection: 'chronograph', strapType: 'silicone', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80' },
      { id: 6, name: 'Celestial Moonphase III', price: 35000, category: 'premium', collection: 'heritage', strapType: 'leather', image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&q=80' }
    ];

    for (const p of products) {
      await db.query(
        'INSERT INTO products (id, name, price, category, collection, strapType, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.price, p.category, p.collection, p.strapType, p.image]
      );
    }

    console.log('Seeding completed. IDs 1-6 are now synchronized.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
