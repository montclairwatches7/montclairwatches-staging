const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder",
});

console.log(`[PAYMENT] Razorpay initialized with Key ID starting with: ${process.env.RAZORPAY_KEY_ID?.substring(0, 8)}...`);

// Create Razorpay Order
router.post("/razorpay/order", protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // Ensure it is an integer (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Razorpay Error: " + (error.error?.description || error.message || "Order creation failed")
    });
  }
});

// Verify Razorpay Payment
router.post("/razorpay/verify", protect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      totalAmount,
      shippingAddress,
      cartItems
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    await connection.beginTransaction();

    // Inventory Check and Reduction
    for (const item of cartItems) {
      const [products] = await connection.query(
        "SELECT stock_quantity, name FROM products WHERE id = ? FOR UPDATE",
        [item.productId]
      );

      if (products.length === 0) throw new Error(`Product ID ${item.productId} not found.`);
      
      const product = products[0];
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}.`);
      }

      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.productId]
      );
    }

    // Create Order in DB
    const [orderRes] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_id, tracking_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        totalAmount,
        "processing",
        JSON.stringify(shippingAddress),
        razorpay_payment_id,
        "TRK" + Math.floor(Math.random() * 100000000)
      ]
    );

    // Insert Order Items
    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map((item) => [
        orderRes.insertId,
        item.productId,
        item.quantity,
        item.price,
      ]);
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
        [orderItems]
      );
    }

    // Clear Cart
    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      orderId: orderRes.insertId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
