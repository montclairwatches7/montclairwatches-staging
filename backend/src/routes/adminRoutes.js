const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
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
} = require('../controllers/adminController');
const {
  getAllCoupons,
  getCouponStats,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponUsage
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateRequestPayload } = require('../validators/schemas');

const os = require('os');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.use(protect);
router.use(admin);
router.get('/stats', getDashboardStats);
router.get('/graph-stats', getGraphStats);
router.get('/orders/export', exportOrdersCSV);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserProfile);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProductsAdmin);
router.post('/products', upload.array('images', 5), validateRequestPayload('products'), createProduct);
router.put('/products/:id', upload.array('images', 5), validateRequestPayload('products'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/coupons', getAllCoupons);
router.get('/coupons/stats', getCouponStats);
router.post('/coupons', validateRequestPayload('coupons'), createCoupon);
router.put('/coupons/:id', validateRequestPayload('coupons'), updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/coupons/:id/usage', getCouponUsage);

module.exports = router;
