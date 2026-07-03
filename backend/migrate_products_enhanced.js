const db = require('./src/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');
        
        await db.query(`
            ALTER TABLE products 
            ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active',
            ADD COLUMN stock_quantity INT DEFAULT 0,
            ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
