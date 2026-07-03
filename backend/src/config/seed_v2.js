const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { faker } = require("@faker-js/faker");

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

    console.log("Executing schema setup (setup_v2.sql)...");
    const sqlPath = path.join(__dirname, "../../setup_v2.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    await connection.query(sql);
    console.log("Schema created successfully.");

    console.log("Generating seed data...");

    const banners = Array.from({ length: 5 }).map(() => [
      faker.company.catchPhrase(),
      faker.lorem.sentence(),
      `https://source.unsplash.com/1600x600/?luxury,watch,${faker.string.alphanumeric(4)}`,
      `https://source.unsplash.com/800x800/?luxury,watch,${faker.string.alphanumeric(4)}`,
      "Shop Now",
      "/collection",
      "Discover",
      "/about",
      "active",
      faker.number.int({ min: 1, max: 10 }),
    ]);
    if (banners.length > 0) {
      await connection.query(
        "INSERT INTO banners (title, subtitle, image_url, mobile_image_url, cta_1_text, cta_1_link, cta_2_text, cta_2_link, status, display_order) VALUES ?",
        [banners],
      );
    }

    const testimonials = Array.from({ length: 30 }).map(() => [
      faker.person.fullName(),
      faker.lorem.paragraph(),
      faker.number.int({ min: 4, max: 5 }),
      faker.datatype.boolean() ? 1 : 0,
      "active",
    ]);
    if (testimonials.length > 0) {
      await connection.query(
        "INSERT INTO testimonials (user_name, content, rating, is_verified_purchase, status) VALUES ?",
        [testimonials],
      );
    }

    const brands = Array.from({ length: 20 }).map(() => [
      faker.company.name(),
      `https://source.unsplash.com/200x200/?logo,company,${faker.string.alphanumeric(4)}`,
      faker.datatype.boolean() ? 1 : 0,
      "active",
    ]);
    if (brands.length > 0) {
      await connection.query(
        "INSERT INTO brands (name, logo_url, is_premium, status) VALUES ?",
        [brands],
      );
    }

    const services = Array.from({ length: 6 }).map((_, idx) => [
      faker.commerce.department(),
      faker.company.catchPhrase(),
      ["Truck", "Lock", "RotateCcw", "Headphones", "Award", "Star"][idx % 6],
      "active",
      idx,
    ]);
    if (services.length > 0) {
      await connection.query(
        "INSERT INTO services (title, description, icon_name, status, display_order) VALUES ?",
        [services],
      );
    }

    const categories = [
      "General",
      "Shipping",
      "Returns",
      "Warranty",
      "Products",
    ];
    const faqs = Array.from({ length: 40 }).map(() => [
      faker.lorem.sentence() + "?",
      faker.lorem.paragraph(),
      faker.helpers.arrayElement(categories),
      "active",
    ]);
    if (faqs.length > 0) {
      await connection.query(
        "INSERT INTO faqs (question, answer, category, status) VALUES ?",
        [faqs],
      );
    }

    const teams = Array.from({ length: 15 }).map(() => [
      faker.person.fullName(),
      faker.person.jobTitle(),
      faker.lorem.sentences(2),
      `https://i.pravatar.cc/300?u=${faker.string.uuid()}`,
      "active",
    ]);
    if (teams.length > 0) {
      await connection.query(
        "INSERT INTO teams (name, role, bio, avatar_url, status) VALUES ?",
        [teams],
      );
    }

    const posts = Array.from({ length: 50 }).map(() => {
      const title = faker.lorem.words(5);
      return [
        title,
        faker.helpers.slugify(title).toLowerCase() +
          "-" +
          faker.string.alphanumeric(4),
        faker.lorem.sentences(2),
        faker.lorem.paragraphs(5, "<br/>\n"),
        `https://source.unsplash.com/800x400/?watch,luxury,${faker.string.alphanumeric(4)}`,
        null,
        faker.helpers.arrayElement(["News", "Reviews", "Guides", "Company"]),
        faker.helpers.arrayElement(["published", "draft"]),
      ];
    });
    if (posts.length > 0) {
      await connection.query(
        "INSERT INTO posts (title, slug, excerpt, content, featured_image_url, author_id, category, status) VALUES ?",
        [posts],
      );
    }

    const [existingProducts] = await connection.query(
      "SELECT id FROM products LIMIT 100",
    );
    const [existingUsers] = await connection.query(
      "SELECT id FROM users LIMIT 100",
    );

    if (existingProducts.length > 0 && existingUsers.length > 0) {
      const reviews = Array.from({ length: 200 }).map(() => [
        faker.helpers.arrayElement(existingProducts).id,
        faker.helpers.arrayElement(existingUsers).id,
        faker.number.float({ min: 1, max: 5, multipleOf: 0.5 }),
        faker.lorem.sentences(2),
        faker.helpers.arrayElement(["approved", "pending", "rejected"]),
      ]);
      await connection.query(
        "INSERT INTO reviews (product_id, user_id, rating, comment, status) VALUES ?",
        [reviews],
      );

      const notifications = Array.from({ length: 150 }).map(() => [
        faker.helpers.arrayElement(existingUsers).id,
        faker.lorem.sentence({ min: 3, max: 6 }),
        faker.lorem.sentences(1),
        faker.datatype.boolean() ? 1 : 0,
        faker.internet.url(),
      ]);
      await connection.query(
        "INSERT INTO notifications (user_id, title, message, is_read, action_url) VALUES ?",
        [notifications],
      );
    } else {
      console.log(
        "Skipping Reviews and Notifications seeding because Products or Users list is empty. Create products/users first.",
      );
    }

    console.log("Successfully seeded 500+ records!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeeder();
