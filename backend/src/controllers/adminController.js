const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { sendOrderUpdateEmail } = require('../utils/emailService');

const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalSales }]] = await db.query("SELECT SUM(total_amount) as totalSales FROM orders WHERE status != 'refunded'");
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'");
    const [recentOrders] = await db.query(
      'SELECT o.*, u.name as customer FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5'
    );
    const [topProducts] = await db.query(
      'SELECT p.name, SUM(oi.quantity) as sold FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.id ORDER BY sold DESC LIMIT 5'
    );

    const [recentUsers] = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT 5"
    );

    const [[{ pendingOrdersCount }]] = await db.query("SELECT COUNT(*) as pendingOrdersCount FROM orders WHERE status = 'pending' OR status = 'payment_pending'");
    const [[{ cancelledOrdersCount }]] = await db.query("SELECT COUNT(*) as cancelledOrdersCount FROM orders WHERE status = 'cancelled'");

    const [salesTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        SUM(total_amount) as amount,
        COUNT(*) as orders
      FROM orders 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `);

    res.json({
      totalSales: totalSales || 0,
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
      pendingOrdersCount: pendingOrdersCount || 0,
      cancelledOrdersCount: cancelledOrdersCount || 0,
      recentUsers,
      recentOrders,
      topProducts,
      salesTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGraphStats = async (req, res) => {
  try {
    const { range = '1w' } = req.query;
    let days = 7;
    let format = '%Y-%m-%d';
    let step = 'day';

    switch (range) {
      case '1d':
        days = 1;
        format = '%Y-%m-%d %H:00';
        step = 'hour';
        break;
      case '1w':
        days = 7;
        format = '%Y-%m-%d';
        step = 'day';
        break;
      case '1m':
        days = 30;
        format = '%Y-%m-%d';
        step = 'day';
        break;
      case '3m':
        days = 90;
        format = '%Y-%m-%d';
        step = 'day';
        break;
      case '6m':
        days = 180;
        format = '%Y-%m';
        step = 'month';
        break;
      case '1y':
        days = 365;
        format = '%Y-%m';
        step = 'month';
        break;
    }

    // Revenue and Sales Trend
    const [trendData] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, ?) as date,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(created_at, ?)
      ORDER BY date ASC
    `, [format, days, format]);

    // Fill gaps in trend data
    const trend = [];
    const now = new Date();
    const startDate = new Date();
    
    if (step === 'hour') {
      startDate.setHours(now.getHours() - 24, 0, 0, 0);
    } else if (step === 'month') {
      startDate.setMonth(now.getMonth() - (range === '6m' ? 6 : 12));
      startDate.setDate(1);
    } else {
      startDate.setDate(now.getDate() - days);
    }

    const dataMap = new Map(trendData.map(item => [item.date, item]));

    let current = new Date(startDate);
    while (current <= now) {
      let dateKey;
      if (step === 'hour') {
        dateKey = current.toISOString().slice(0, 13).replace('T', ' ') + ':00';
      } else if (step === 'month') {
        dateKey = current.toISOString().slice(0, 7);
      } else {
        dateKey = current.toISOString().slice(0, 10);
      }

      const existing = dataMap.get(dateKey);
      trend.push({
        date: dateKey,
        revenue: existing ? Number(existing.revenue) : 0,
        orders: existing ? Number(existing.orders) : 0
      });

      if (step === 'hour') current.setHours(current.getHours() + 1);
      else if (step === 'month') current.setMonth(current.getMonth() + 1);
      else current.setDate(current.getDate() + 1);
    }

    // Category breakdown
    const [categorySalesRaw] = await db.query(`
      SELECT 
        c.name as category,
        COUNT(oi.id) as count,
        SUM(oi.price * oi.quantity) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY c.id
      ORDER BY revenue DESC
    `, [days]);

    const categorySales = categorySalesRaw.map(item => ({
      ...item,
      count: Number(item.count),
      revenue: Number(item.revenue)
    }));

    res.json({
      trend,
      categorySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      payment_status, 
      payment_method, 
      date_start, 
      date_end, 
      price_min, 
      price_max,
      search 
    } = req.query;

    let query = `
      SELECT o.*, u.name as customer, u.email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }
    if (payment_status && payment_status !== 'all') {
      query += ' AND o.payment_status = ?';
      params.push(payment_status);
    }
    if (payment_method && payment_method !== 'all') {
      query += ' AND o.payment_method = ?';
      params.push(payment_method);
    }
    if (date_start) {
      query += ' AND o.created_at >= ?';
      params.push(date_start);
    }
    if (date_end) {
      query += ' AND o.created_at <= ?';
      params.push(date_end + ' 23:59:59');
    }
    if (price_min) {
      query += ' AND o.total_amount >= ?';
      params.push(price_min);
    }
    if (price_max) {
      query += ' AND o.total_amount <= ?';
      params.push(price_max);
    }
    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.query(query, params);

    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processingOrders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledOrders,
        COUNT(CASE WHEN status = 'returned' THEN 1 END) as returnedOrders
      FROM orders
    `);

    res.json({ orders, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const [[order]] = await db.query(
      `SELECT o.*, u.name as customer_name, u.email, u.phone 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [items] = await db.query(
      `SELECT oi.*, p.name as product_name, p.image 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status, payment_status } = req.body;
  try {
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    params.push(req.params.id);
    await db.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    if (status) {
      const [[order]] = await db.query(
        'SELECT u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?', 
        [req.params.id]
      );
      if (order?.email) {
        sendOrderUpdateEmail(order.email, req.params.id, status);
      }
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, is_blocked, last_login, created_at FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  const { is_blocked } = req.body;
  try {
    await db.query('UPDATE users SET is_blocked = ? WHERE id = ?', [is_blocked, req.params.id]);
    res.json({ message: `User ${is_blocked ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id, name, email, role, phone, is_blocked, last_login, created_at FROM users WHERE id = ?', 
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [orders] = await db.query(
      'SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({
      ...user,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createProduct = async (req, res) => {
  const { 
    name, brand, model_number, category, collection, mrp, price,
    case_diameter, case_material, dial_colour, movement_type, caliber,
    water_resistance, strap_material, crystal, functions, power_reserve,
    case_thickness, lug_width, warranty, key_highlights, whats_in_the_box,
    status, stock_quantity
  } = req.body;

  if (stock_quantity === undefined || stock_quantity === null || Number(stock_quantity) <= 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed: stock_quantity: Stock quantity must be greater than 0 for new products',
      errors: [
        {
          message: 'Stock quantity must be greater than 0 for new products',
          path: ['stock_quantity']
        }
      ]
    });
  }

  try {
    let imageUrl = null;
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        cloudinary.uploader.upload(file.path, { folder: 'montclair/products' })
      );
      const uploadResults = await Promise.all(uploadPromises);
      
      imageUrls = uploadResults.map(result => result.secure_url);
      imageUrl = imageUrls[0];

      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    const sanitizeDecimal = (val) => (val === '' || val === undefined || val === null) ? null : val;

    const [result] = await db.query(
      `INSERT INTO products (
        name, brand, model_number, category, collection, mrp, price, image, images,
        case_diameter, case_material, dial_colour, movement_type, caliber,
        water_resistance, strap_material, crystal, functions, power_reserve,
        case_thickness, lug_width, warranty, key_highlights, whats_in_the_box,
        status, stock_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, brand, model_number, category, collection, sanitizeDecimal(mrp), sanitizeDecimal(price),
        imageUrl, JSON.stringify(imageUrls),
        case_diameter, case_material, dial_colour, movement_type, caliber,
        water_resistance, strap_material, crystal, functions, power_reserve,
        case_thickness, lug_width, warranty, key_highlights, whats_in_the_box,
        status || 'active', stock_quantity || 0
      ]
    );
    res.status(201).json({ message: 'Product created', id: result.insertId });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const sanitizeDecimal = (val) => (val === '' || val === undefined || val === null) ? null : val;

  try {
    const fieldsToUpdate = [];
    const params = [];

    const possibleFields = [
      'name', 'brand', 'model_number', 'category', 'collection',
      'case_diameter', 'case_material', 'dial_colour', 'movement_type', 'caliber',
      'water_resistance', 'strap_material', 'crystal', 'functions', 'power_reserve',
      'case_thickness', 'lug_width', 'warranty', 'key_highlights', 'whats_in_the_box',
      'status', 'stock_quantity'
    ];

    possibleFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate.push(`${field}=?`);
        params.push(req.body[field]);
      }
    });

    if (req.body.price !== undefined) {
      fieldsToUpdate.push(`price=?`);
      params.push(sanitizeDecimal(req.body.price));
    }
    
    if (req.body.mrp !== undefined) {
      fieldsToUpdate.push(`mrp=?`);
      params.push(sanitizeDecimal(req.body.mrp));
    }

    let imagesToSave = null;
    if (req.body.existingImages) {
      imagesToSave = JSON.parse(req.body.existingImages);
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        cloudinary.uploader.upload(file.path, { folder: 'montclair/products' })
      );
      const uploadResults = await Promise.all(uploadPromises);
      const newImageUrls = uploadResults.map(result => result.secure_url);
      
      if (imagesToSave === null) {
        imagesToSave = newImageUrls;
      } else {
        imagesToSave = [...imagesToSave, ...newImageUrls];
      }
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    if (imagesToSave !== null) {
      fieldsToUpdate.push(`images=?`);
      params.push(JSON.stringify(imagesToSave));
      
      if (imagesToSave.length > 0) {
        fieldsToUpdate.push(`image=?`);
        params.push(imagesToSave[0]);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const query = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE id=?`;
    params.push(req.params.id);

    await db.query(query, params);
    res.json({ message: 'Product updated' });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 30, search, category, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category = c.id WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.brand LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND p.status = ? ';
      params.push(status);
    }

    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportOrdersCSV = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.id, u.name as customer, o.total_amount as amount, o.status, o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    let csv = 'Order ID,Customer,Amount,Status,Date\n';
    orders.forEach(o => {
      csv += `${o.id},"${o.customer}",${o.amount},${o.status},${o.created_at}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders_export.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getGraphStats,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getAllUsers,
  blockUser,
  deleteUser,
  getUserProfile,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  exportOrdersCSV
};
