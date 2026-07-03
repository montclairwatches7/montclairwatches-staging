const db = require('../config/db');

const Cart = {
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT c.*, p.name, p.price, p.image FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  },

  addItem: async (userId, productId, quantity = 1) => {
    // Check if exists
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId]
      );
    } else {
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }
  },

  updateQuantity: async (userId, productId, quantity) => {
    await db.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );
  },

  removeItem: async (userId, productId) => {
    await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
  }
};

module.exports = Cart;
