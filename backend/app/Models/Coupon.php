<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'min_order_value',
        'max_discount_limit',
        'start_date',
        'expiry_date',
        'usage_limit_total',
        'usage_limit_per_user',
        'status',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'min_order_value' => 'float',
        'max_discount_limit' => 'float',
        'start_date' => 'datetime',
        'expiry_date' => 'datetime',
        'usage_limit_total' => 'integer',
        'usage_limit_per_user' => 'integer',
    ];
}
