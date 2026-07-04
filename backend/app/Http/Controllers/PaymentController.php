<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function createOrder(Request $request)
    {
        $request->validate(['amount' => 'required']);
        $amount = (float) $request->amount;

        $keyId = env('RAZORPAY_KEY_ID', 'rzp_test_placeholder');
        $keySecret = env('RAZORPAY_KEY_SECRET', 'razorpay_secret_placeholder');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.razorpay.com/v1/orders');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_USERPWD, $keyId . ':' . $keySecret);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'amount' => round($amount * 100), // Ensure it is an integer (paise)
            'currency' => 'INR',
            'receipt' => 'receipt_' . time(),
        ]));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            Log::error('Razorpay Order Creation Error. Response: ' . $response);
            $errDecoded = json_decode($response, true);
            $errMsg = isset($errDecoded['error']['description']) ? $errDecoded['error']['description'] : 'Order creation failed';
            return response()->json(['success' => false, 'message' => 'Razorpay Error: ' . $errMsg], 500);
        }

        $orderData = json_decode($response, true);

        return response()->json([
            'success' => true,
            'order' => $orderData,
            'key' => $keyId
        ]);
    }

    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
            'totalAmount' => 'required',
            'shippingAddress' => 'required',
            'cartItems' => 'required|array'
        ]);

        $orderId = $request->razorpay_order_id;
        $paymentId = $request->razorpay_payment_id;
        $signature = $request->razorpay_signature;
        $totalAmount = (float) $request->totalAmount;
        $shippingAddress = $request->shippingAddress;
        $cartItems = $request->cartItems;

        $keySecret = env('RAZORPAY_KEY_SECRET', 'razorpay_secret_placeholder');

        // Verify HMAC-SHA256 signature
        $expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $keySecret);

        if ($expectedSignature !== $signature) {
            return response()->json(['success' => false, 'message' => 'Invalid payment signature'], 400);
        }

        DB::beginTransaction();

        try {
            // Inventory Check and Reduction
            foreach ($cartItems as $item) {
                $product = Product::lockForUpdate()->find($item['productId']);

                if (!$product) {
                    throw new \Exception("Product ID {$item['productId']} not found.");
                }

                if ($product->stock_quantity < (int) $item['quantity']) {
                    throw new \Exception("Insufficient stock for {$product->name}.");
                }

                $product->decrement('stock_quantity', (int) $item['quantity']);
            }

            // Create Order in DB
            $dbOrder = Order::create([
                'user_id' => $request->user()->id,
                'total_amount' => $totalAmount,
                'status' => 'processing',
                'shipping_address' => $shippingAddress,
                'payment_id' => $paymentId,
                'tracking_number' => 'TRK' . rand(10000000, 99999999),
            ]);

            // Insert Order Items
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $dbOrder->id,
                    'product_id' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            // Clear Cart
            CartItem::where('user_id', $request->user()->id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment verified and order placed',
                'orderId' => $dbOrder->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Razorpay Verification Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
