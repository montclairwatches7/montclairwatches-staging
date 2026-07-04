<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CouponController extends Controller
{
    public function index()
    {
        $coupons = Coupon::orderBy('created_at', 'desc')->get();
        return response()->json($coupons);
    }

    public function getCouponStats()
    {
        $total = Coupon::count();
        $active = Coupon::where('status', 'active')->where('expiry_date', '>', now())->count();
        $inactive = Coupon::where('status', '!=', 'active')->orWhere('expiry_date', '<=', now())->count();

        return response()->json([
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive
        ]);
    }

    public function store(Request $request)
    {
        try {
            $coupon = Coupon::create($request->all());
            return response()->json($coupon, 201);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return response()->json(['message' => 'Coupon code already exists'], 400);
            }
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update($request->all());
        return response()->json(['message' => 'Coupon updated successfully']);
    }

    public function destroy($id)
    {
        Coupon::findOrFail($id)->delete();
        return response()->json(['message' => 'Coupon deleted successfully']);
    }

    public function getCouponUsage($id)
    {
        $usage = CouponUsage::where('coupon_id', $id)
            ->join('users', 'coupon_usage.user_id', '=', 'users.id')
            ->join('orders', 'coupon_usage.order_id', '=', 'orders.id')
            ->select('coupon_usage.*', 'users.name as user_name', 'users.email as user_email', 'orders.total_amount as order_total', 'orders.status as order_status')
            ->orderBy('coupon_usage.used_at', 'desc')
            ->get();

        return response()->json($usage);
    }

    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'amount' => 'required'
        ]);

        $code = $request->code;
        $amount = (float) $request->amount;

        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid coupon code'], 404);
        }

        if ($coupon->status !== 'active') {
            return response()->json(['message' => 'Coupon is no longer active'], 400);
        }

        if ($coupon->expiry_date && $coupon->expiry_date < now()) {
            return response()->json(['message' => 'Coupon has expired'], 400);
        }

        $minOrder = (float) $coupon->min_order_value;
        if ($amount < $minOrder) {
            return response()->json([
                'message' => 'Minimum order value for this coupon is ₹' . number_format($minOrder)
            ], 400);
        }

        $discount = 0.0;
        $discValue = (float) $coupon->discount_value;

        if ($coupon->discount_type === 'percentage') {
            $discount = ($amount * $discValue) / 100;
            $maxDiscount = (float) $coupon->max_discount_limit;
            if ($coupon->max_discount_limit && $discount > $maxDiscount) {
                $discount = $maxDiscount;
            }
        } else {
            $discount = $discValue;
        }

        return response()->json([
            'message' => 'Coupon applied successfully',
            'coupon' => [
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $discValue,
                'discount_amount' => round($discount)
            ]
        ]);
    }
}
