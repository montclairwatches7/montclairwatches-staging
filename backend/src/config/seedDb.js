const db = require('./db');

const seedProducts = async () => {
  const products = [
    {
      name: 'Heritage Chronograph Gold',
      brand: 'Montclair',
      price: 12400,
      image: '/src/assets/watches/chronograph-gold.jpg',
      category: 'classic',
      collection: 'chronograph',
      strapType: 'leather',
      dialColor: 'White',
      reference: 'MC-742-G',
      description: 'A testament to horological purity.',
      caseSize: '40mm',
      movement: 'Calibre H.01',
      waterResistance: '10 ATM',
      powerReserve: '72 Hours',
      caseMaterial: 'Rose Gold',
      featured: 1,
      trending: 1
    },
    {
      name: 'Deep Sea Diver Blue',
      brand: 'Montclair',
      price: 9800,
      image: '/src/assets/watches/diver-blue.jpg',
      category: 'sport',
      collection: 'diver',
      strapType: 'metal',
      dialColor: 'Blue',
      reference: 'MC-310-S',
      description: 'Engineered for the depths.',
      caseSize: '42mm',
      movement: 'Calibre M.55',
      waterResistance: '300m',
      powerReserve: '60 Hours',
      caseMaterial: 'Titanium',
      featured: 1,
      trending: 0
    },
    {
      name: 'Monolith Skeleton',
      brand: 'Montclair',
      price: 18900,
      image: '/src/assets/watches/skeleton-rose.jpg',
      category: 'premium',
      collection: 'heritage',
      strapType: 'leather',
      dialColor: 'Skeleton',
      reference: 'MC-880-P',
      description: 'Hand-guilloché dial with hand-stitched alligator strap.',
      caseSize: '41mm',
      movement: 'Calibre M.900',
      waterResistance: '5 ATM',
      powerReserve: '96 Hours',
      caseMaterial: 'Platinum',
      featured: 1,
      trending: 1
    }
  ];

  try {
    // Clear existing products first to avoid duplicates
    await db.query('DELETE FROM products');
    
    for (const p of products) {
      await db.query(
        `INSERT INTO products 
        (name, brand, price, image, category, collection, strapType, dialColor, reference, description, caseSize, movement, waterResistance, powerReserve, caseMaterial, featured, trending) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.brand, p.price, p.image, p.category, p.collection, p.strapType, p.dialColor, p.reference, p.description, p.caseSize, p.movement, p.waterResistance, p.powerReserve, p.caseMaterial, p.featured, p.trending]
      );
    }
    console.log('Sample products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedProducts();
