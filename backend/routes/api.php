<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\GenericController;
use App\Http\Controllers\CouponController;

// ─── API Health Check ────────────────────────────────────────────────────────
Route::get('/', function () {
    return response()->json(['status' => 'ok', 'message' => 'Montclair Luxury API is running.']);
});

// ─── Temporary Route to Run Migrations on Hostinger ──────────────────────────
Route::get('/run-migrations', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
        return response()->json([
            'status' => 'success',
            'message' => 'Migrations ran successfully!',
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

// ─── Auth Routes ─────────────────────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOTP']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected Auth
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'getMe']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    
    // Addresses
    Route::get('/auth/addresses', [AuthController::class, 'getAddresses']);
    Route::post('/auth/addresses', [AuthController::class, 'addAddress']);
    Route::delete('/auth/addresses/{id}', [AuthController::class, 'deleteAddress']);
    Route::put('/auth/addresses/{id}', [AuthController::class, 'updateAddress']);
    Route::put('/auth/addresses/{id}/default', [AuthController::class, 'setDefaultAddress']);
});

// ─── Products & Categories ───────────────────────────────────────────────────
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);

// ─── Store & Wishlist (Protected) ────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/store/wishlist', [StoreController::class, 'getWishlist']);
    Route::post('/store/wishlist/toggle', [StoreController::class, 'toggleWishlist']);
    
    Route::get('/store/cart', [StoreController::class, 'getCart']);
    Route::post('/store/cart/add', [StoreController::class, 'addToCart']);
    Route::put('/store/cart/quantity', [StoreController::class, 'updateCartQuantity']);
    Route::delete('/store/cart/{productId}', [StoreController::class, 'removeFromCart']);
    Route::delete('/store/cart', [StoreController::class, 'clearCart']);
});

// ─── Coupons & Validation ─────────────────────────────────────────────────────
Route::get('/coupons', [CouponController::class, 'index']);
Route::post('/store/validate-coupon', [CouponController::class, 'validateCoupon']);

// ─── Payments & Orders (Protected) ───────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payment/razorpay/order', [PaymentController::class, 'createOrder']);
    Route::post('/payment/razorpay/verify', [PaymentController::class, 'verifyPayment']);

    Route::post('/orders', [OrderController::class, 'createOrder']);
    Route::get('/orders', [OrderController::class, 'getMyOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'getOrderById']);
    Route::get('/orders/status/{paymentId}', [OrderController::class, 'checkStatus']);
    Route::post('/orders/verify', [OrderController::class, 'verifyPayment']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
});

// ─── Admin Routes (Protected, Admin-only) ─────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/stats/graph', [AdminController::class, 'getGraphStats']);
    Route::get('/admin/orders', [AdminController::class, 'getAllOrders']);
    Route::get('/admin/orders/{id}', [AdminController::class, 'getOrderDetails']);
    Route::put('/admin/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
    Route::put('/admin/users/{id}/block', [AdminController::class, 'blockUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/admin/users/{id}', [AdminController::class, 'getUserProfile']);
    
    // Product Management
    Route::get('/admin/products', [ProductController::class, 'index']);
    Route::post('/admin/products', [AdminController::class, 'createProduct']);
    Route::put('/admin/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/admin/products/{id}', [AdminController::class, 'deleteProduct']);
    
    // Coupon Management
    Route::post('/admin/coupons', [CouponController::class, 'store']);
    Route::put('/admin/coupons/{id}', [CouponController::class, 'update']);
    Route::delete('/admin/coupons/{id}', [CouponController::class, 'destroy']);
    Route::get('/admin/coupons/{id}/usage', [CouponController::class, 'getCouponUsage']);
    
    // Image Upload
    Route::post('/upload', [UploadController::class, 'upload']);
});

// ─── Dynamic Generic Modules (Fallback routing) ──────────────────────────────
Route::get('/{tableName}', [GenericController::class, 'getAll']);
Route::get('/{tableName}/{id}', [GenericController::class, 'getById']);
Route::post('/{tableName}', [GenericController::class, 'create']);
Route::put('/{tableName}/{id}', [GenericController::class, 'update']);
Route::delete('/{tableName}/{id}', [GenericController::class, 'delete']);
Route::post('/{tableName}/bulk', [GenericController::class, 'bulkAction']);
