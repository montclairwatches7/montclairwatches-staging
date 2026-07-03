const express = require('express');
const router = express.Router();
const { 
  getWishlist, toggleWishlist, 
  getCart, addToCart, updateCartQuantity, removeFromCart, clearCart 
} = require('../controllers/storeController');
const { validateCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);

router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.put('/cart/quantity', updateCartQuantity);
router.delete('/cart/:productId', removeFromCart);
router.delete('/cart', clearCart);

router.post('/validate-coupon', validateCoupon);

module.exports = router;
