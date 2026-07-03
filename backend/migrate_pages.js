const db = require('./src/config/db');

async function migrate() {
  try {
    console.log('Creating pages table...');
    await db.execute("CREATE TABLE IF NOT EXISTS `pages` (" +
        "`id` int(11) NOT NULL AUTO_INCREMENT," +
        "`title` varchar(255) NOT NULL," +
        "`slug` varchar(255) NOT NULL," +
        "`content` longtext NOT NULL," +
        "`status` enum('active','inactive') DEFAULT 'active'," +
        "`created_at` timestamp NOT NULL DEFAULT current_timestamp()," +
        "`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()," +
        "PRIMARY KEY (`id`)," +
        "UNIQUE KEY `slug` (`slug`)" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;");
    
    // Insert initial privacy policy if not exists
    const [existing] = await db.execute("SELECT id FROM pages WHERE slug = 'privacy'");
    if (existing.length === 0) {
      console.log('Inserting initial privacy policy...');
      await db.execute("INSERT INTO pages (title, slug, content, status) VALUES (" +
          "'Privacy Policy', " +
          "'privacy', " +
          "'<h2>1. Collection of Information</h2><p>At Montclair, we collect information that you provide directly to us when you create an account, make a purchase, or communicate with our concierge team.</p><h2>2. Use of Information</h2><p>We use the information we collect to process your orders, provide customer support, and send you updates about our collections and services.</p>', " +
          "'active'" +
        ")");
    }
    
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
