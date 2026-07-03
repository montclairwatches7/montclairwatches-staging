const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'src', 'config', '..', '..', '.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('--- RESETTING PRODUCT REGISTRY ---');
    await connection.query('DELETE FROM products');
    await connection.query('ALTER TABLE products AUTO_INCREMENT = 1');
    console.log('[SUCCESS] All existing products purged.');

    const products = [
      {
        name: "Rolex Submariner Date",
        brand: "Rolex",
        model_number: "126610LN",
        category: "4", // Luxury
        collection: "Submariner",
        mrp: 1250000,
        price: 1190000,
        image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000",
        images: JSON.stringify(["https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000"]),
        case_diameter: "41mm",
        case_material: "Oystersteel",
        dial_colour: "Black",
        movement_type: "Automatic",
        caliber: "Cal. 3235",
        water_resistance: "300m / 1000ft",
        strap_material: "Oystersteel Bracelet",
        crystal: "Sapphire with Cyclops",
        functions: "Date, Rotating Bezel",
        power_reserve: "70 Hours",
        case_thickness: "12.5mm",
        lug_width: "21mm",
        warranty: "5 Years International",
        key_highlights: "• Unidirectional rotatable bezel\n• Cerachrom insert in ceramic\n• Chromalight display with long-lasting blue luminescence",
        whats_in_the_box: "Green Rolex Box, Warranty Card, Manual, Chronometer Tag",
        status: "active",
        stock_quantity: 5
      },
      {
        name: "Omega Speedmaster Moonwatch",
        brand: "Omega",
        model_number: "310.30.42.50.01.001",
        category: "4", // Luxury
        collection: "Speedmaster",
        mrp: 750000,
        price: 720000,
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000",
        images: JSON.stringify(["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000"]),
        case_diameter: "42mm",
        case_material: "Stainless Steel",
        dial_colour: "Step Black",
        movement_type: "Manual Winding",
        caliber: "Cal. 3861 Master Chronometer",
        water_resistance: "50m",
        strap_material: "Brushed Steel Bracelet",
        crystal: "Hesalite Crystal",
        functions: "Chronograph, Tachymeter",
        power_reserve: "50 Hours",
        case_thickness: "13.2mm",
        lug_width: "20mm",
        warranty: "5 Years",
        key_highlights: "• First watch on the moon\n• METAS certified Master Chronometer\n• Dot over 90 bezel",
        whats_in_the_box: "Omega Moonwatch Box, Speedmaster Booklet, 3 Cards, Cleaning Cloth",
        status: "active",
        stock_quantity: 8
      },
      {
        name: "TAG Heuer Aquaracer Professional",
        brand: "TAG Heuer",
        model_number: "WBP201A.BA0632",
        category: "5", // Sports
        collection: "Aquaracer",
        mrp: 320000,
        price: 295000,
        image: "https://images.unsplash.com/photo-1622434641406-a15812345ad1?q=80&w=1000",
        images: JSON.stringify(["https://images.unsplash.com/photo-1622434641406-a15812345ad1?q=80&w=1000"]),
        case_diameter: "43mm",
        case_material: "Steel Fine-Brushed/Polished",
        dial_colour: "Black Sunray",
        movement_type: "Automatic",
        caliber: "Calibre 5",
        water_resistance: "300m",
        strap_material: "Steel Bracelet",
        crystal: "Sapphire",
        functions: "Date, Rotating Ceramic Bezel",
        power_reserve: "38 Hours",
        case_thickness: "12.2mm",
        lug_width: "21.5mm",
        warranty: "2 Years",
        key_highlights: "• Professional diver's watch\n• Octagonal hour markers\n• Sliding pressure-proof clasp",
        whats_in_the_box: "TAG Heuer Box, Warranty QR Card, User Manual",
        status: "active",
        stock_quantity: 12
      },
      {
        name: "Tissot PRX Powermatic 80",
        brand: "Tissot",
        model_number: "T137.407.11.041.00",
        category: "1", // Men
        collection: "T-Classic",
        mrp: 65000,
        price: 61500,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000",
        images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000"]),
        case_diameter: "40mm",
        case_material: "316L Stainless Steel",
        dial_colour: "Blue Waffle Pattern",
        movement_type: "Automatic",
        caliber: "Powermatic 80.111",
        water_resistance: "100m",
        strap_material: "Integrated Steel Bracelet",
        crystal: "Sapphire with AR Coating",
        functions: "Date",
        power_reserve: "80 Hours",
        case_thickness: "10.9mm",
        lug_width: "12mm (Integrated)",
        warranty: "2 Years",
        key_highlights: "• Incredible 80-hour power reserve\n• Nivachron balance spring\n• Integrated bracelet design",
        whats_in_the_box: "Tissot Heritage Box, Manual, Warranty Card",
        status: "active",
        stock_quantity: 25
      },
      {
        name: "Cartier Tank Must",
        brand: "Cartier",
        model_number: "WSTA0041",
        category: "2", // Women
        collection: "Tank",
        mrp: 350000,
        price: 335000,
        image: "https://images.unsplash.com/photo-1508685096489-7a689bdca02f?q=80&w=1000",
        images: JSON.stringify(["https://images.unsplash.com/photo-1508685096489-7a689bdca02f?q=80&w=1000"]),
        case_diameter: "33.7mm x 25.5mm",
        case_material: "Steel",
        dial_colour: "Silvered",
        movement_type: "Quartz",
        caliber: "High-autonomy Quartz",
        water_resistance: "30m",
        strap_material: "Black Alligator Leather",
        crystal: "Sapphire",
        functions: "Hours, Minutes",
        power_reserve: "8 Years (Battery)",
        case_thickness: "6.6mm",
        lug_width: "19mm",
        warranty: "8 Years (Cartier Care)",
        key_highlights: "• Iconic rectangular design\n• Blue synthetic spinel cabochon\n• Roman numerals",
        whats_in_the_box: "Red Cartier Box, Care Booklet, Warranty Card",
        status: "active",
        stock_quantity: 3
      }
    ];

    for (const p of products) {
      const sql = `INSERT INTO products (
        name, brand, model_number, category, collection, mrp, price, image, images,
        case_diameter, case_material, dial_colour, movement_type, caliber,
        water_resistance, strap_material, crystal, functions, power_reserve,
        case_thickness, lug_width, warranty, key_highlights, whats_in_the_box,
        status, stock_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        p.name, p.brand, p.model_number, p.category, p.collection, p.mrp, p.price, p.image, p.images,
        p.case_diameter, p.case_material, p.dial_colour, p.movement_type, p.caliber,
        p.water_resistance, p.strap_material, p.crystal, p.functions, p.power_reserve,
        p.case_thickness, p.lug_width, p.warranty, p.key_highlights, p.whats_in_the_box,
        p.status, p.stock_quantity
      ];

      await connection.query(sql, values);
      console.log(`[SUCCESS] Registered: ${p.name}`);
    }

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL: Seeding failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
