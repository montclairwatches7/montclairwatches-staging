<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('status', 'active')
            ->select([
                'id', 'name', 'brand', 'price', 'originalPrice', 'image', 'images',
                'category', 'rating', 'reviewCount', 'urlSlug', 'status', 'stock_quantity',
                'caseSize', 'movement', 'waterResistance', 'powerReserve', 'caseMaterial',
                'created_at', 'updated_at',
            ])
            ->get();

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::where('id', $id)->first();
        if ($product) {
            return response()->json($product);
        }
        return response()->json(['message' => 'Product not found'], 404);
    }
}
