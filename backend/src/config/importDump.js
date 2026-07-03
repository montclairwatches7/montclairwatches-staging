const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true,
};

async function importDump() {
  let connection;
  try {
    console.log("Connecting to Railway database...");
    connection = await mysql.createConnection(dbConfig);

    console.log("Clearing existing tables...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    const [tables] = await connection.query("SHOW TABLES");
    const dbName = dbConfig.database;
    const tableKey = `Tables_in_${dbName}`;

    for (const row of tables) {
      const tableName = row[tableKey] || row[Object.keys(row)[0]];
      console.log(`Dropping table: ${tableName}`);
      await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Reading montclair.sql...");
    const dumpPath = path.join(__dirname, "../../../montclair.sql");
    const sql = fs.readFileSync(dumpPath, "utf8");

    console.log("Executing SQL dump (this may take a few seconds)...");
    await connection.query(sql);

    console.log("✅ Database imported successfully from montclair.sql!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing database:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

importDump();
