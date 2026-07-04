<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    private function uploadToCloudinary($filePath)
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            Log::warning('Cloudinary credentials missing in .env! Cannot upload product images.');
            return null;
        }

        $timestamp = time();
        $signature = sha1("folder=montclair/products&timestamp=" . $timestamp . $apiSecret);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, [
            'file' => new \CURLFile($filePath),
            'timestamp' => $timestamp,
            'api_key' => $apiKey,
            'signature' => $signature,
            'folder' => 'montclair/products'
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return isset($data['secure_url']) ? $data['secure_url'] : null;
    }

    public function getDashboardStats()
    {
        $totalSales = Order::where('status', '!=', 'refunded')->sum('total_amount');
        $totalOrders = Order::count();
        $totalUsers = User::where('role', 'user')->count();

        $recentOrders = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->select('orders.*', 'users.name as customer')
            ->orderBy('orders.created_at', 'desc')
            ->limit(5)
            ->get();

        $topProducts = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(order_items.quantity) as sold'))
            ->groupBy('products.id', 'products.name')
            ->orderBy('sold', 'desc')
            ->limit(5)
            ->get();

        $recentUsers = User::where('role', 'user')
            ->select('id', 'name', 'email', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $pendingOrdersCount = Order::whereIn('status', ['pending', 'payment_pending'])->count();
        $cancelledOrdersCount = Order::where('status', 'cancelled')->count();

        $salesTrend = Order::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d') as date"),
                DB::raw("SUM(total_amount) as amount"),
                DB::raw("COUNT(*) as orders")
            )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'totalSales' => (float) $totalSales,
            'totalOrders' => $totalOrders,
            'totalUsers' => $totalUsers,
            'pendingOrdersCount' => $pendingOrdersCount,
            'cancelledOrdersCount' => $cancelledOrdersCount,
            'recentUsers' => $recentUsers,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'salesTrend' => $salesTrend
        ]);
    }

    public function getGraphStats(Request $request)
    {
        $range = $request->query('range', '1w');
        $days = 7;
        $format = '%Y-%m-%d';
        $step = 'day';

        switch ($range) {
            case '1d':
                $days = 1;
                $format = '%Y-%m-%d %H:00';
                $step = 'hour';
                break;
            case '1w':
                $days = 7;
                $format = '%Y-%m-%d';
                $step = 'day';
                break;
            case '1m':
                $days = 30;
                $format = '%Y-%m-%d';
                $step = 'day';
                break;
            case '3m':
                $days = 90;
                $format = '%Y-%m-%d';
                $step = 'day';
                break;
            case '6m':
                $days = 180;
                $format = '%Y-%m';
                $step = 'month';
                break;
            case '1y':
                $days = 365;
                $format = '%Y-%m';
                $step = 'month';
                break;
        }

        $trendData = Order::select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as date"),
                DB::raw("SUM(total_amount) as revenue"),
                DB::raw("COUNT(*) as orders")
            )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Populate gaps
        $trend = [];
        $now = now();
        $startDate = now();

        if ($step === 'hour') {
            $startDate = now()->subHours(24)->startOfHour();
        } elseif ($step === 'month') {
            $startDate = now()->subMonths($range === '6m' ? 6 : 12)->startOfMonth();
        } else {
            $startDate = now()->subDays($days);
        }

        $dataMap = [];
        foreach ($trendData as $item) {
            $dataMap[$item->date] = $item;
        }

        $current = clone $startDate;
        while ($current <= $now) {
            if ($step === 'hour') {
                $dateKey = $current->format('Y-m-d H:00');
            } elseif ($step === 'month') {
                $dateKey = $current->format('Y-m');
            } else {
                $dateKey = $current->format('Y-m-d');
            }

            $existing = isset($dataMap[$dateKey]) ? $dataMap[$dateKey] : null;
            $trend[] = [
                'date' => $dateKey,
                'revenue' => $existing ? (float) $existing->revenue : 0,
                'orders' => $existing ? (int) $existing->orders : 0
            ];

            if ($step === 'hour') $current->addHour();
            elseif ($step === 'month') $current->addMonth();
            else $current->addDay();
        }

        $categorySales = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category', '=', 'categories.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select(
                'categories.name as category',
                DB::raw('COUNT(order_items.id) as count'),
                DB::raw('SUM(order_items.price * order_items.quantity) as revenue')
            )
            ->where('orders.created_at', '>=', now()->subDays($days))
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->get();

        $formattedCategorySales = $categorySales->map(function ($item) {
            return [
                'category' => $item->category,
                'count' => (int) $item->count,
                'revenue' => (float) $item->revenue
            ];
        });

        return response()->json([
            'trend' => $trend,
            'categorySales' => $formattedCategorySales
        ]);
    }

    public function getAllOrders(Request $request)
    {
        $query = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->select('orders.*', 'users.name as customer', 'users.email');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('orders.status', $request->status);
        }
        if ($request->filled('date_start')) {
            $query->where('orders.created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->where('orders.created_at', '<=', $request->date_end . ' 23:59:59');
        }
        if ($request->filled('price_min')) {
            $query->where('orders.total_amount', '>=', $request->price_min);
        }
        if ($request->filled('price_max')) {
            $query->where('orders.total_amount', '<=', $request->price_max);
        }
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'like', $search)
                  ->orWhere('users.email', 'like', $search)
                  ->orWhere('orders.id', 'like', $search);
            });
        }

        $orders = $query->orderBy('orders.created_at', 'desc')->get();

        $stats = [
            'totalOrders' => Order::count(),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'processingOrders' => Order::where('status', 'processing')->count(),
            'cancelledOrders' => Order::where('status', 'cancelled')->count(),
            'returnedOrders' => Order::where('status', 'returned')->count(),
        ];

        return response()->json(['orders' => $orders, 'stats' => $stats]);
    }

    public function getOrderDetails($id)
    {
        $order = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->select('orders.*', 'users.name as customer_name', 'users.email', 'users.phone')
            ->where('orders.id', $id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $items = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->select('order_items.*', 'products.name as product_name', 'products.image')
            ->where('order_items.order_id', $order->id)
            ->get();

        $arr = $order->toArray();
        $arr['items'] = $items;

        return response()->json($arr);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'nullable|string',
            'payment_status' => 'nullable|string'
        ]);

        $order = Order::findOrFail($id);
        
        $updateData = [];
        if ($request->filled('status')) {
            $updateData['status'] = $request->status;
        }
        if ($request->filled('payment_status')) {
            $updateData['payment_status'] = $request->payment_status;
        }

        if (empty($updateData)) {
            return response()->json(['message' => 'Nothing to update'], 400);
        }

        $order->update($updateData);

        if ($request->filled('status')) {
            $user = User::find($order->user_id);
            if ($user && $user->email) {
                try {
                    $statusColors = [
                        'processing' => '#3b82f6',
                        'shipped' => '#8b5cf6',
                        'delivered' => '#10b981',
                        'cancelled' => '#ef4444',
                    ];
                    $newStatus = $request->status;
                    $color = isset($statusColors[$newStatus]) ? $statusColors[$newStatus] : '#000';

                    $htmlContent = '
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #b87333; text-align: center;">Montclair Luxury</h2>
                            <p>Dear Client,</p>
                            <p>The protocols for your acquisition <strong>#' . $order->id . '</strong> have been updated.</p>
                            <div style="background: ' . $color . '; color: white; padding: 10px; text-align: center; border-radius: 5px; font-weight: bold; text-transform: uppercase;">
                                Status: ' . $newStatus . '
                            </div>
                            <p style="margin-top: 20px;">You can track the live status of your timepiece in your dashboard.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #666; text-align: center;">This is an automated transmission. Please do not reply.</p>
                        </div>';

                    Mail::html($htmlContent, function ($message) use ($user, $order, $newStatus) {
                        $message->to($user->email)
                            ->subject("Order Update: #{$order->id} has been updated to " . strtoupper($newStatus))
                            ->from(env('EMAIL_USER', 'hello@demomailtrap.co'), 'Montclair Luxury');
                    });
                } catch (\Exception $e) {
                    Log::error('Order Update Email dispatch failed: ' . $e->getMessage());
                }
            }
        }

        return response()->json(['message' => 'Order updated successfully']);
    }

    public function getAllUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_blocked', 'last_login', 'created_at')->get();
        return response()->json($users);
    }

    public function blockUser(Request $request, $id)
    {
        $request->validate(['is_blocked' => 'required|boolean']);
        $user = User::findOrFail($id);
        $user->update(['is_blocked' => $request->is_blocked]);

        return response()->json(['message' => 'User ' . ($request->is_blocked ? 'blocked' : 'unblocked')]);
    }

    public function deleteUser($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function getUserProfile($id)
    {
        $user = User::select('id', 'name', 'email', 'role', 'phone', 'is_blocked', 'last_login', 'created_at')
            ->where('id', $id)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $orders = Order::where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        $arr = $user->toArray();
        $arr['orders'] = $orders;

        return response()->json($arr);
    }

    public function createProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'stock_quantity' => 'required|integer|min:1'
        ]);

        $data = $request->all();
        $imageUrls = [];
        $imageUrl = null;

        if ($request->hasFile('images')) {
            $files = $request->file('images');
            if (is_array($files)) {
                foreach ($files as $file) {
                    $url = $this->uploadToCloudinary($file->getRealPath());
                    if ($url) {
                        $imageUrls[] = $url;
                    }
                }
            } else {
                $url = $this->uploadToCloudinary($files->getRealPath());
                if ($url) {
                    $imageUrls[] = $url;
                }
            }
            $imageUrl = isset($imageUrls[0]) ? $imageUrls[0] : null;
        }

        $data['image'] = $imageUrl;
        $data['images'] = $imageUrls;
        $data['status'] = $request->input('status', 'active');

        $product = Product::create($data);

        return response()->json(['message' => 'Product created', 'id' => $product->id], 201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->all();

        if ($request->hasFile('images')) {
            $files = $request->file('images');
            $imageUrls = [];
            if (is_array($files)) {
                foreach ($files as $file) {
                    $url = $this->uploadToCloudinary($file->getRealPath());
                    if ($url) {
                        $imageUrls[] = $url;
                    }
                }
            } else {
                $url = $this->uploadToCloudinary($files->getRealPath());
                if ($url) {
                    $imageUrls[] = $url;
                }
            }
            if (!empty($imageUrls)) {
                $data['image'] = $imageUrls[0];
                $data['images'] = $imageUrls;
            }
        }

        $product->update($data);

        return response()->json(['message' => 'Product updated successfully']);
    }

    public function deleteProduct($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
