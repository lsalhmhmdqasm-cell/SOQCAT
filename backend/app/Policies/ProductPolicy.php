<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('manage_products');
    }

    public function view(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('manage_products') &&
               ($user->isSuperAdmin() || $product->shop_id === $user->shop_id);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage_products');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('manage_products') &&
               ($user->isSuperAdmin() || $product->shop_id === $user->shop_id);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('manage_products') &&
               ($user->isSuperAdmin() || $product->shop_id === $user->shop_id);
    }
}
