const db = require('../config/db');

const getWishlist = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT w.id, w.product_id, p.name, p.price, p.image 
       FROM wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_id = ?`,
      [req.user.id]
    );
    res.json(rows.map(row => ({ 
      ...row, 
      product_id: row.product_id.toString() 
    })));
  } catch (error) {
    console.error('getWishlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  if (req.user.id === 'admin-env-id') {
    return res.status(403).json({ message: 'Administrators cannot manage a personal wishlist.' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      await db.query('DELETE FROM wishlist WHERE id = ?', [existing[0].id]);
      res.json({ message: 'Removed from wishlist', action: 'removed' });
    } else {
      await db.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [req.user.id, productId]
      );
      res.json({ message: 'Added to wishlist', action: 'added' });
    }
  } catch (error) {
    console.error('toggleWishlist error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Product or user does not exist in the database.' });
    }
    res.status(500).json({ message: 'Internal server error.', details: error.message });
  }
};


const getCart = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT product_id as productId, quantity FROM cart_items WHERE user_id = ?',
      [req.user.id]
    );
    res.json(rows.map(row => ({ ...row, productId: row.productId.toString() })));
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  if (req.user.id === 'admin-env-id') {
    return res.status(403).json({ message: 'Administrators cannot add to cart. Please log in as a customer.' });
  }

  try {
    await db.query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
      [req.user.id, productId, quantity]
    );
    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('addToCart error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Product or user does not exist in the database.' });
    }
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return res.status(400).json({ message: 'Invalid product ID format.' });
    }
    res.status(500).json({ message: 'Internal server error occurred while adding to cart.', details: error.message });
  }
};

const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    if (quantity <= 0) {
      await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
    } else {
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, req.user.id, productId]
      );
    }
    res.json({ message: 'Quantity updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
};
