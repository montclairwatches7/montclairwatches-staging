const db = require('./db');
const fs = require('fs');
const path = require('path');

const initDb = async () => {
  try {
    console.log('Reading setup.sql...');
    const sqlPath = path.join(__dirname, '../../setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL by semicolon to execute one by one
    // Note: This is a simple split, might fail with complex triggers, 
    // but for simple CREATE TABLE it works.
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      await db.query(statement);
    }

    console.log('Database tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating database tables:', error);
    process.exit(1);
  }
};

initDb();
