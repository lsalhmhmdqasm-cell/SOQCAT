<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isShopAdmin();
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }
        if ($user->isShopAdmin()) {
            return $order->shop_id === $user->shop_id;
        }
        return $order->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user !== null;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->isSuperAdmin() || ($user->isShopAdmin() && $order->shop_id === $user->shop_id);
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->isSuperAdmin() || ($user->isShopAdmin() && $order->shop_id === $user->shop_id);
    }
}

