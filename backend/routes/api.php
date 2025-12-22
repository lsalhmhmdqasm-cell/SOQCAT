<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\LoyaltyController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\ReferralController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/shops', [ShopController::class, 'index']);
Route::get('/shops/{id}', [ShopController::class, 'show']);

Route::get('/shops/{shop}/payment-methods', [PaymentMethodController::class, 'index']);

// Private Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Image Upload
    Route::post('/upload', [ImageController::class, 'store']);

    // Payment Methods
    Route::get('/payment-methods', [PaymentMethodController::class, 'shopMethods']); // Shop Admin
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::put('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update']);
    Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy']);
    Route::post('/payment-methods/{paymentMethod}/toggle', [PaymentMethodController::class, 'toggleActive']);

    // Stock & Expiry Management
    Route::put('/products/{product}/stock', [StockController::class, 'updateStock']);
    Route::get('/products/expiring', [StockController::class, 'getExpiringSoon']);
    Route::get('/products/expired', [StockController::class, 'getExpired']);
    Route::post('/products/expired/mark', [StockController::class, 'markExpired']);

    // Loyalty & Marketing
    Route::get('/loyalty/points', [LoyaltyController::class, 'index']);
    Route::post('/coupons/verify', [CouponController::class, 'verify']);
    
    // Coupons (Shop Admin)
    Route::get('/coupons', [CouponController::class, 'index']);
    Route::post('/coupons', [CouponController::class, 'store']);
    Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);
    
    // Referrals
    Route::get('/referrals', [ReferralController::class, 'index']);
    Route::post('/referrals', [ReferralController::class, 'store']);

    // User Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    
    // Order Tracking
    Route::get('/orders/track/{trackingNumber}', [OrderController::class, 'track']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::put('/orders/{id}/assign-delivery', [OrderController::class, 'assignDelivery']);

    // Shop Admin Routes
    Route::get('/shop/orders', [OrderController::class, 'shopOrders']);
    
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Super Admin Routes
    Route::post('/shops', [ShopController::class, 'store']);
    
    // Client Management
    Route::get('/clients', [\App\Http\Controllers\ClientController::class, 'index']);
    Route::post('/clients', [\App\Http\Controllers\ClientController::class, 'store']);
    Route::put('/clients/{id}', [\App\Http\Controllers\ClientController::class, 'update']);
    Route::delete('/clients/{id}', [\App\Http\Controllers\ClientController::class, 'destroy']);
    
    // Support Tickets
    Route::get('/tickets', [\App\Http\Controllers\SupportTicketController::class, 'index']);
    Route::post('/tickets', [\App\Http\Controllers\SupportTicketController::class, 'store']);
    Route::post('/tickets/{id}/reply', [\App\Http\Controllers\SupportTicketController::class, 'reply']);
    Route::put('/tickets/{id}/close', [\App\Http\Controllers\SupportTicketController::class, 'close']);
    
    // System Updates
    Route::get('/system-updates', [\App\Http\Controllers\SystemUpdateController::class, 'index']); // Public/Auth
    Route::post('/system-updates', [\App\Http\Controllers\SystemUpdateController::class, 'store']); // Admin
    Route::delete('/system-updates/{id}', [\App\Http\Controllers\SystemUpdateController::class, 'destroy']); // Admin
    
    // Categories
    Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
    Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store']);
    Route::delete('/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'destroy']);
    
    // Wishlist
    Route::get('/wishlist', [\App\Http\Controllers\WishlistController::class, 'index']);
    Route::post('/wishlist/{productId}', [\App\Http\Controllers\WishlistController::class, 'toggle']);
    Route::get('/wishlist/check/{productId}', [\App\Http\Controllers\WishlistController::class, 'check']);
    
    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    
    // Addresses
    Route::get('/addresses', [\App\Http\Controllers\AddressController::class, 'index']);
    Route::post('/addresses', [\App\Http\Controllers\AddressController::class, 'store']);
    Route::put('/addresses/{id}', [\App\Http\Controllers\AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [\App\Http\Controllers\AddressController::class, 'destroy']);
    
    // Delivery Persons
    Route::get('/delivery-persons', [\App\Http\Controllers\DeliveryPersonController::class, 'index']);
    Route::post('/delivery-persons', [\App\Http\Controllers\DeliveryPersonController::class, 'store']);
    Route::put('/delivery-persons/{id}/status', [\App\Http\Controllers\DeliveryPersonController::class, 'updateStatus']);
    Route::delete('/delivery-persons/{id}', [\App\Http\Controllers\DeliveryPersonController::class, 'destroy']);
    
    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);
    
    // Users (for admin)
    Route::get('/users', function(Request $request) {
        if ($request->user()->role !== 'shop_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return \App\Models\User::where('role', 'customer')->get();
    });
    
    // Image uploads
    Route::post('/upload/product-image', [\App\Http\Controllers\ImageController::class, 'uploadProductImage']);
    Route::post('/upload/category-image', [\App\Http\Controllers\ImageController::class, 'uploadCategoryImage']);
    Route::post('/upload/shop-logo', [\App\Http\Controllers\ImageController::class, 'uploadShopLogo']);
    Route::delete('/images', [\App\Http\Controllers\ImageController::class, 'deleteImage']);
    
    // Reviews (authenticated)
    Route::post('/reviews', [\App\Http\Controllers\ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [\App\Http\Controllers\ReviewController::class, 'destroy']);
});
