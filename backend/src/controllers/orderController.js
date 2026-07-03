const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createOrder = async (req, res) => {
  const { cartItems, totalAmount, shippingAddress } = req.body;
  const connection = await db.getConnection();
  const paymentId =
    "PAY_" + uuidv4().replace(/-/g, "").slice(0, 12).toUpperCase();

  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, status, payment_id) VALUES (?, ?, ?, "payment_pending", ?)',
      [req.user.id, totalAmount, JSON.stringify(shippingAddress), paymentId],
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.productId, item.quantity, item.price],
      );
    }

    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [
      req.user.id,
    ]);

    await connection.commit();

    const upiId = process.env.MERCHANT_UPI_ID || "prince@upi";
    const name = process.env.MERCHANT_NAME || "Montclair Luxury";
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&cu=INR&tn=${paymentId}`;

    res.status(201).json({
      id: orderId,
      paymentId,
      upiLink,
      message: "Order sequence initialized. Awaiting settlement.",
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const checkStatus = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT status FROM orders WHERE payment_id = ? AND user_id = ?",
      [req.params.paymentId, req.user.id],
    );
    if (orders.length === 0)
      return res.status(404).json({ message: "Order not found" });
    res.json({ status: orders[0].status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    await db.query(
      'UPDATE orders SET status = "processing" WHERE payment_id = ? AND status = "payment_pending"',
      [paymentId],
    );
    res.json({ message: "Payment verified and archival sequence advanced." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );

    for (let order of orders) {
      const [items] = await db.query(
        "SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?",
        [order.id],
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];
    const [items] = await db.query(
      "SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?",
      [order.id],
    );
    order.items = items;

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  const { reason } = req.body;
  try {
    const [orders] = await db.query(
      "SELECT status FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );

    if (orders.length === 0)
      return res.status(404).json({ message: "Order not found" });
    if (!["payment_pending", "processing"].includes(orders[0].status)) {
      return res
        .status(400)
        .json({ message: "Cannot cancel order in current state" });
    }

    await db.query(
      'UPDATE orders SET status = "cancelled", cancel_reason = ? WHERE id = ?',
      [reason, req.params.id],
    );

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  checkStatus,
  verifyPayment,
};
