<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'ticket_code',
    'customer_name',
    'phone_number',
    'group_type',
    'base_price',
    'play_game',
    'game_price',
    'total_price',
    'booked_at',
    'processed_by',
])]
class Booking extends Model
{
    protected $casts = [
        'base_price' => 'decimal:2',
        'play_game' => 'boolean',
        'game_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'booked_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
