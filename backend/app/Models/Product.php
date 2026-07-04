<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'brand', 'model_number', 'price', 'originalPrice', 'mrp',
        'image', 'images', 'category', 'collection', 'strapType', 'dialColor',
        'inStock', 'rating', 'reviewCount', 'reference', 'description',
        'featured', 'trending', 'caseSize', 'movementType', 'movement',
        'waterResistance', 'powerReserve', 'caseMaterial', 'caseThickness',
        'lugWidth', 'crystal', 'functions', 'warranty', 'status',
        'stock_quantity', 'highlights', 'boxContents', 'heroTagline',
        'shortDescription', 'fullDescription', 'faq', 'metaTitle',
        'metaDescription', 'urlSlug', 'case_diameter', 'case_material',
        'dial_colour', 'movement_type', 'caliber', 'water_resistance',
        'strap_material', 'power_reserve', 'case_thickness', 'lug_width',
        'key_highlights', 'whats_in_the_box'
    ];

    protected $casts = [
        'price' => 'float',
        'originalPrice' => 'float',
        'mrp' => 'float',
        'images' => 'array',
        'faq' => 'array',
        'inStock' => 'boolean',
        'featured' => 'boolean',
        'trending' => 'boolean',
        'rating' => 'float',
        'reviewCount' => 'integer',
        'stock_quantity' => 'integer',
    ];

    public function categoryModel()
    {
        return $this->belongsTo(Category::class, 'category');
    }
}
