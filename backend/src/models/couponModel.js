const db = require("../config/db");

const Coupon = {
  findAll: async () => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM coupons ORDER BY created_at DESC",
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const [rows] = await db.query("SELECT * FROM coupons WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  findByCode: async (code) => {
    try {
      const [rows] = await db.query("SELECT * FROM coupons WHERE code = ?", [
        code,
      ]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  create: async (couponData) => {
    try {
      const {
        code,
        discount_type,
        discount_value,
        min_order_value,
        max_discount_limit,
        start_date,
        expiry_date,
        usage_limit_total,
        usage_limit_per_user,
        status,
      } = couponData;

      const [result] = await db.query(
        `INSERT INTO coupons (
          code, discount_type, discount_value, min_order_value, 
          max_discount_limit, start_date, expiry_date, 
          usage_limit_total, usage_limit_per_user, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          discount_type,
          discount_value,
          min_order_value || 0,
          max_discount_limit || null,
          start_date || new Date(),
          expiry_date,
          usage_limit_total || null,
          usage_limit_per_user || 1,
          status || "active",
        ],
      );
      return { id: result.insertId, ...couponData };
    } catch (error) {
      throw error;
    }
  },

  update: async (id, couponData) => {
    try {
      const fields = [];
      const values = [];

      Object.entries(couponData).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (fields.length === 0) return null;

      values.push(id);
      const query = `UPDATE coupons SET ${fields.join(", ")} WHERE id = ?`;
      await db.query(query, values);
      return true;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await db.query("DELETE FROM coupons WHERE id = ?", [id]);
      return true;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const [[{ total }]] = await db.query(
        "SELECT COUNT(*) as total FROM coupons",
      );
      const [[{ active }]] = await db.query(
        "SELECT COUNT(*) as active FROM coupons WHERE status = 'active' AND expiry_date > NOW()",
      );
      const [[{ inactive }]] = await db.query(
        "SELECT COUNT(*) as inactive FROM coupons WHERE status != 'active' OR expiry_date <= NOW()",
      );

      return { total, active, inactive };
    } catch (error) {
      throw error;
    }
  },

  getUsage: async (couponId) => {
    try {
      const [rows] = await db.query(
        `SELECT cu.*, u.name as user_name, u.email as user_email, o.total_amount as order_total, o.status as order_status
         FROM coupon_usage cu
         JOIN users u ON cu.user_id = u.id
         JOIN orders o ON cu.order_id = o.id
         WHERE cu.coupon_id = ?
         ORDER BY cu.used_at DESC`,
        [couponId],
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Coupon;
