<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    public function getWishlist(Request $request)
    {
        $userId = $request->user()->id;
        $wishlist = Wishlist::where('user_id', $userId)
            ->join('products', 'wishlist.product_id', '=', 'products.id')
            ->select('wishlist.id', 'wishlist.product_id', 'products.name', 'products.price', 'products.image')
            ->get();

        // Convert product_id to string matching frontend expectation
        $formatted = $wishlist->map(function ($item) {
            $arr = $item->toArray();
            $arr['product_id'] = (string) $arr['product_id'];
            return $arr;
        });

        return response()->json($formatted);
    }

    public function toggleWishlist(Request $request)
    {
        $request->validate(['productId' => 'required']);
        $productId = $request->productId;
        $userId = $request->user()->id;

        if ($request->user()->role === 'admin') {
            return response()->json(['message' => 'Administrators cannot manage a personal wishlist.'], 403);
        }

        if (!Product::where('id', $productId)->exists()) {
            return response()->json(['message' => 'Product or user does not exist in the database.'], 400);
        }

        $existing = Wishlist::where('user_id', $userId)->where('product_id', $productId)->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['message' => 'Removed from wishlist', 'action' => 'removed']);
        } else {
            Wishlist::create([
                'user_id' => $userId,
                'product_id' => $productId
            ]);
            return response()->json(['message' => 'Added to wishlist', 'action' => 'added']);
        }
    }

    public function getCart(Request $request)
    {
        $userId = $request->user()->id;
        $cartItems = CartItem::where('user_id', $userId)
            ->select('product_id as productId', 'quantity')
            ->get();

        $formatted = $cartItems->map(function ($item) {
            return [
                'productId' => (string) $item->productId,
                'quantity' => (int) $item->quantity
            ];
        });

        return response()->json($formatted);
    }

    public function addToCart(Request $request)
    {
        $request->validate(['productId' => 'required']);
        $productId = $request->productId;
        $quantity = (int) $request->input('quantity', 1);
        $userId = $request->user()->id;

        if ($request->user()->role === 'admin') {
            return response()->json(['message' => 'Administrators cannot add to cart. Please log in as a customer.'], 403);
        }

        if (!Product::where('id', $productId)->exists()) {
            return response()->json(['message' => 'Product or user does not exist in the database.'], 400);
        }

        $existing = CartItem::where('user_id', $userId)->where('product_id', $productId)->first();

        if ($existing) {
            $existing->increment('quantity', $quantity);
        } else {
            CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity
            ]);
        }

        return response()->json(['message' => 'Cart updated']);
    }

    public function updateCartQuantity(Request $request)
    {
        $request->validate([
            'productId' => 'required',
            'quantity' => 'required|integer'
        ]);

        $productId = $request->productId;
        $quantity = (int) $request->quantity;
        $userId = $request->user()->id;

        if ($quantity <= 0) {
            CartItem::where('user_id', $userId)->where('product_id', $productId)->delete();
        } else {
            CartItem::where('user_id', $userId)->where('product_id', $productId)->update(['quantity' => $quantity]);
        }

        return response()->json(['message' => 'Quantity updated']);
    }

    public function removeFromCart(Request $request, $productId)
    {
        $userId = $request->user()->id;
        CartItem::where('user_id', $userId)->where('product_id', $productId)->delete();
        return response()->json(['message' => 'Removed from cart']);
    }

    public function clearCart(Request $request)
    {
        $userId = $request->user()->id;
        CartItem::where('user_id', $userId)->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}
