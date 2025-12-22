<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'shop_id',
        'type',
        'is_active',
        'bank_name',
        'account_name',
        'account_number',
        'branch',
        'e_wallet_network',
        'wallet_name',
        'wallet_number',
        'instructions'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function isBankTransfer()
    {
        return $this->type === 'bank_transfer';
    }

    public function isEWallet()
    {
        return $this->type === 'e_wallet';
    }

    public function getDisplayName()
    {
        if ($this->isBankTransfer()) {
            return "تحويل بنكي - {$this->bank_name}";
        }
        
        return "محفظة إلكترونية - {$this->e_wallet_network}";
    }
}
