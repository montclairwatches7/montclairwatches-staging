const db = require('../config/db');

const User = {
  create: async (name, email, password) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return result.insertId;
  },


  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT id, name, email, role, phone, is_blocked, avatar FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(data.avatar);
    }

    if (fields.length === 0) return;

    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  updatePassword: async (id, password) => {
    await db.query('UPDATE users SET password = ? WHERE id = ?', [password, id]);
  },

  updatePasswordByEmail: async (email, password) => {
    await db.query('UPDATE users SET password = ? WHERE email = ?', [password, email]);
  }
};

module.exports = User;
