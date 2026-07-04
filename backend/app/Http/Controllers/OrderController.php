<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function createOrder(Request $request)
    {
        $request->validate([
            'cartItems' => 'required|array',
            'totalAmount' => 'required',
            'shippingAddress' => 'required'
        ]);

        $userId = $request->user()->id;
        $totalAmount = (float) $request->totalAmount;
        $shippingAddress = $request->shippingAddress;

        $paymentId = 'PAY_' . strtoupper(substr(str_replace('-', '', Str::uuid()->toString()), 0, 12));

        DB::beginTransaction();

        try {
            $order = Order::create([
                'user_id' => $userId,
                'total_amount' => $totalAmount,
                'shipping_address' => $shippingAddress,
                'status' => 'payment_pending',
                'payment_id' => $paymentId,
            ]);

            foreach ($request->cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            CartItem::where('user_id', $userId)->delete();

            DB::commit();

            $upiId = env('MERCHANT_UPI_ID', 'prince@upi');
            $name = env('MERCHANT_NAME', 'Montclair Luxury');
            $upiLink = 'upi://pay?pa=' . $upiId . '&pn=' . rawurlencode($name) . '&am=' . $totalAmount . '&cu=INR&tn=' . $paymentId;

            return response()->json([
                'id' => $order->id,
                'paymentId' => $paymentId,
                'upiLink' => $upiLink,
                'message' => 'Order sequence initialized. Awaiting settlement.',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function checkStatus($paymentId, Request $request)
    {
        $order = Order::where('payment_id', $paymentId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json(['status' => $order->status]);
    }

    public function verifyPayment(Request $request)
    {
        $request->validate(['paymentId' => 'required|string']);
        $paymentId = $request->paymentId;

        Order::where('payment_id', $paymentId)
            ->where('status', 'payment_pending')
            ->update(['status' => 'processing']);

        return response()->json(['message' => 'Payment verified and archival sequence advanced.']);
    }

    public function getMyOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $formatted = $orders->map(function ($order) {
            $items = OrderItem::where('order_id', $order->id)
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->select('order_items.*', 'products.name', 'products.image')
                ->get();
            
            $arr = $order->toArray();
            $arr['items'] = $items;
            return $arr;
        });

        return response()->json($formatted);
    }

    public function getOrderById(Request $request, $id)
    {
        $order = Order::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $items = OrderItem::where('order_id', $order->id)
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('order_items.*', 'products.name', 'products.image')
            ->get();

        $arr = $order->toArray();
        $arr['items'] = $items;

        return response()->json($arr);
    }

    public function cancelOrder(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);
        $reason = $request->reason;
        $userId = $request->user()->id;

        $order = Order::where('id', $id)->where('user_id', $userId)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if (!in_array($order->status, ['payment_pending', 'processing'])) {
            return response()->json(['message' => 'Cannot cancel order in current state'], 400);
        }

        $order->update([
            'status' => 'cancelled',
            'cancel_reason' => $reason
        ]);

        return response()->json(['message' => 'Order cancelled successfully']);
    }
}
