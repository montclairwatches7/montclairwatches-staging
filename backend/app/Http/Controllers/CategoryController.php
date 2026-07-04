<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function getCategoryStats()
    {
        $total = Category::count();
        $active = Category::where('status', 'active')->count();
        $inactive = Category::where('status', 'inactive')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'active' => $active,
                'inactive' => $inactive
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $name = $request->name;
        $existing = Category::where('name', $name)->first();
        if ($existing) {
            return response()->json(['message' => 'Category name must be unique'], 400);
        }

        $slug = Str::slug($name);

        $category = Category::create([
            'name' => $name,
            'slug' => $slug,
            'status' => $request->input('status', 'active')
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string']);

        $name = $request->name;
        $existing = Category::where('name', $name)->where('id', '!=', $id)->first();
        if ($existing) {
            return response()->json(['message' => 'Category name must be unique'], 400);
        }

        $slug = Str::slug($name);
        $category = Category::findOrFail($id);
        $category->update([
            'name' => $name,
            'slug' => $slug,
            'status' => $request->input('status', 'active')
        ]);

        return response()->json($category);
    }

    public function destroy($id)
    {
        Category::findOrFail($id)->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
