const db = require('../config/db');

const Address = {
  create: async (userId, data) => {
    const { 
      full_name, fullName, 
      street, 
      city, 
      state, 
      zip_code, zip, 
      country, 
      phone, 
      is_default, isDefault 
    } = data;
    
    const finalName = fullName || full_name;
    const finalZip = zip || zip_code;
    const finalIsDefault = isDefault || is_default || false;

    if (finalIsDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await db.query(
      'INSERT INTO addresses (user_id, full_name, street, city, zip, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, finalName, street, city, finalZip, phone, finalIsDefault]
    );
    return result.insertId;
  },

  update: async (id, userId, data) => {
    const { 
      full_name, fullName, 
      street, 
      city, 
      zip_code, zip, 
      phone, 
      is_default, isDefault 
    } = data;

    const finalName = fullName || full_name;
    const finalZip = zip || zip_code;
    const finalIsDefault = isDefault || is_default || false;

    if (finalIsDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    await db.query(
      'UPDATE addresses SET full_name = ?, street = ?, city = ?, zip = ?, phone = ?, is_default = ? WHERE id = ? AND user_id = ?',
      [finalName, street, city, finalZip, phone, finalIsDefault, id, userId]
    );
  },

  findByUserId: async (userId) => {
    const [rows] = await db.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);
    return rows;
  },

  delete: async (id, userId) => {
    await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
  },

  setDefault: async (id, userId) => {
    await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    await db.query('UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
  }
};

module.exports = Address;
