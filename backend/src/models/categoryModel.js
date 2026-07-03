const db = require('../config/db');

const Category = {
  findAll: async (onlyActive = false) => {
    try {
      let query = 'SELECT * FROM categories';
      if (onlyActive) {
        query += " WHERE status = 'active'";
      }
      query += ' ORDER BY id ASC';
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  findByName: async (name) => {
    try {
      const [rows] = await db.query('SELECT * FROM categories WHERE name = ?', [name]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  create: async (categoryData) => {
    try {
      const { name, slug, status } = categoryData;
      const [result] = await db.query(
        'INSERT INTO categories (name, slug, status) VALUES (?, ?, ?)',
        [name, slug, status || 'active']
      );
      return { id: result.insertId, ...categoryData };
    } catch (error) {
      throw error;
    }
  },

  update: async (id, categoryData) => {
    try {
      const { name, slug, status } = categoryData;
      await db.query(
        'UPDATE categories SET name = ?, slug = ?, status = ? WHERE id = ?',
        [name, slug, status, id]
      );
      return { id, ...categoryData };
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await db.query('DELETE FROM categories WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const [total] = await db.query('SELECT COUNT(*) as count FROM categories');
      const [active] = await db.query("SELECT COUNT(*) as count FROM categories WHERE status = 'active'");
      const [inactive] = await db.query("SELECT COUNT(*) as count FROM categories WHERE status = 'inactive'");
      
      return {
        total: total[0].count,
        active: active[0].count,
        inactive: inactive[0].count
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Category;
