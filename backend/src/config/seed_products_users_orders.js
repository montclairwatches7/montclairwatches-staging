const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Montclair",
  port: process.env.DB_PORT || 3306,
  multipleStatements: true,
};

async function runSeeder() {
  let connection;
  try {
    console.log("Connecting to database...");
    connection = await mysql.createConnection(dbConfig);

    console.log("Generating completely fresh users, products, and orders...");

    const password = await bcrypt.hash("password123", 10);
    const users = Array.from({ length: 100 }).map(() => [
      faker.person.fullName(),
      faker.internet.email(),
      password,
      "user",
      faker.phone.number(),
      `https://i.pravatar.cc/150?u=${faker.string.uuid()}`,
      0,
    ]);
    if (users.length > 0) {
      await connection.query(
        "INSERT INTO users (name, email, password, role, phone, avatar, is_blocked) VALUES ?",
        [users],
      );
    }

    const products = Array.from({ length: 150 }).map(() => {
      const category = faker.helpers.arrayElement([
        "classic",
        "sport",
        "premium",
      ]);
      const collection = faker.helpers.arrayElement([
        "chronograph",
        "heritage",
        "diver",
        "aviator",
      ]);
      const price = faker.number.int({ min: 50, max: 5000 });
      const originalPrice = price + faker.number.int({ min: 100, max: 2000 });
      const imageUrl = `https://source.unsplash.com/400x400/?watch,luxury,${faker.string.alphanumeric(5)}`;
      const images = JSON.stringify([
        imageUrl,
        `https://source.unsplash.com/400x400/?watch,luxury,${faker.string.alphanumeric(5)}`,
      ]);

      return [
        faker.commerce.productName() + " Watch",
        faker.company.name(),
        price,
        originalPrice,
        imageUrl,
        images,
        category,
        collection,
        faker.helpers.arrayElement(["leather", "metal", "silicone"]),
        faker.color.human(),
        faker.datatype.boolean() ? 1 : 0,
        faker.number.float({ min: 3, max: 5, multipleOf: 0.1 }),
        faker.number.int({ min: 1, max: 500 }),
        "MC-" + faker.string.alphanumeric(6).toUpperCase(),
        faker.commerce.productDescription(),
        faker.datatype.boolean() ? 1 : 0,
        faker.datatype.boolean() ? 1 : 0,
        faker.number.int({ min: 38, max: 45 }) + "mm",
        faker.helpers.arrayElement(["Automatic", "Mechanical", "Quartz"]),
        faker.number.int({ min: 3, max: 30 }) + " ATM",
        faker.number.int({ min: 30, max: 90 }) + " Hours",
        faker.helpers.arrayElement(["Steel", "Gold", "Titanium", "Ceramic"]),
        faker.number.int({ min: 0, max: 100 }),
      ];
    });

    if (products.length > 0) {
      await connection.query(
        `
        INSERT INTO products (
            name, brand, price, originalPrice, image, images, category, collection,
            strapType, dialColor, inStock, rating, reviewCount, reference, description,
            featured, trending, caseSize, movement, waterResistance, powerReserve, caseMaterial, stock_quantity
        ) VALUES ?
      `,
        [products],
      );
    }

    const [existingProducts] = await connection.query(
      "SELECT id, price FROM products",
    );
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE role="user"',
    );

    if (existingProducts.length > 0 && existingUsers.length > 0) {
      for (let i = 0; i < 250; i++) {
        const user = faker.helpers.arrayElement(existingUsers);
        const productInfo = faker.helpers.arrayElement(existingProducts);
        const quantity = faker.number.int({ min: 1, max: 3 });
        const totalAmount = productInfo.price * quantity;

        const [orderRes] = await connection.query(
          `
                INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_id, tracking_number)
                VALUES (?, ?, ?, ?, ?, ?)
             `,
          [
            user.id,
            totalAmount,
            faker.helpers.arrayElement([
              "payment_pending",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ]),
            faker.location.streetAddress() + ", " + faker.location.city(),
            "PAY-" + faker.string.alphanumeric(8).toUpperCase(),
            "TRK" + faker.number.int({ min: 100000000, max: 999999999 }),
          ],
        );

        await connection.query(
          `
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
             `,
          [orderRes.insertId, productInfo.id, quantity, productInfo.price],
        );
      }
    }

    console.log("Successfully seeded Products, Users, and Orders!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeeder();
