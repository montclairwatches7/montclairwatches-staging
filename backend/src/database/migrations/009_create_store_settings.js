/**
 * 009_create_store_settings.js
 * Creates the store_settings table for admin-managed store config
 * (used by storeController.js).
 */

exports.up = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id          INT          AUTO_INCREMENT PRIMARY KEY,
      \`key\`     VARCHAR(100) NOT NULL UNIQUE,
      value       LONGTEXT     NULL,
      type        ENUM('text','json','boolean','number') NOT NULL DEFAULT 'text',
      label       VARCHAR(255) NULL,
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_key (\`key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Insert default store settings
  await connection.query(`
    INSERT IGNORE INTO store_settings (\`key\`, value, type, label) VALUES
      ('store_name',        'Montclair Watches',   'text',    'Store Name'),
      ('store_email',       '',                    'text',    'Store Email'),
      ('store_phone',       '',                    'text',    'Store Phone'),
      ('store_address',     '',                    'text',    'Store Address'),
      ('currency',          'INR',                 'text',    'Currency Code'),
      ('currency_symbol',   '₹',                   'text',    'Currency Symbol'),
      ('free_shipping_min', '1000',                'number',  'Free Shipping Min Amount'),
      ('shipping_charge',   '99',                  'number',  'Default Shipping Charge'),
      ('tax_rate',          '0',                   'number',  'Tax Rate (%)'),
      ('maintenance_mode',  'false',               'boolean', 'Maintenance Mode'),
      ('social_links',      '{}',                  'json',    'Social Media Links'),
      ('logo',              '',                    'text',    'Store Logo URL')
  `);
};

exports.down = async (connection) => {
  await connection.query(`DROP TABLE IF EXISTS store_settings`);
};
