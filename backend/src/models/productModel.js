const db = require("../config/db");

const Product = {
  findAll: async (includeInactive = false) => {
    try {
      let query = "SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category = c.id";
      if (!includeInactive) {
        query += " WHERE p.status = 'active'";
      }
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  findById: async (id) => {
    try {
      const [rows] = await db.query(
        "SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category = c.id WHERE p.id = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Product;
