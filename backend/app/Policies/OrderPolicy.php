<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('manage_orders');
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->hasPermissionTo('manage_orders')) {
            return $user->isSuperAdmin() || $order->shop_id === $user->shop_id;
        }

        // Customer can view their own orders
        return $order->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true; // Customers can create orders
    }

    public function update(User $user, Order $order): bool
    {
        return $user->hasPermissionTo('manage_orders') &&
               ($user->isSuperAdmin() || $order->shop_id === $user->shop_id);
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->hasPermissionTo('manage_orders') &&
               ($user->isSuperAdmin() || $order->shop_id === $user->shop_id);
    }
}
