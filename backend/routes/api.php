<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\LoyaltyController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SuperAdmin\ClientController as SAClientController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PlatformLandingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/leads', [LeadController::class, 'store'])->middleware('throttle:20,1');
Route::get('/platform/landing', [PlatformLandingController::class, 'show']);
Route::get('/platform/pricing-plans', [PlatformLandingController::class, 'publicPricing']);
Route::get('/platform/partners', [PlatformLandingController::class, 'partners']);
Route::get('/platform/stats', [PlatformLandingController::class, 'stats']);
Route::get('/platform/testimonials', [PlatformLandingController::class, 'testimonials']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/recommendations', [ProductController::class, 'recommendations']);

    Route::get('/shops', [ShopController::class, 'index']);
    Route::get('/shops/{id}', [ShopController::class, 'show']);
    Route::get('/shops/{id}/settings', [ShopController::class, 'settingsPublic']);

Route::get('/shops/{shop}/payment-methods', [PaymentMethodController::class, 'index']);

// Private Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Super Admin: Leads management
    Route::get('/super-admin/leads', [LeadController::class, 'index']);
    Route::put('/super-admin/leads/{id}', [LeadController::class, 'update']);
    Route::get('/super-admin/platform/landing', [PlatformLandingController::class, 'adminShow']);
    Route::put('/super-admin/platform/landing', [PlatformLandingController::class, 'update']);
    Route::post('/super_admin/pricing-plans', [SAClientController::class, 'storePlan']);
    Route::put('/super_admin/pricing-plans/{id}', [SAClientController::class, 'updatePlan']);
    Route::delete('/super_admin/pricing-plans/{id}', [SAClientController::class, 'deletePlan']);
    Route::post('/super_admin/pricing-plans/{id}/toggle', [SAClientController::class, 'togglePlan']);

    // Image Upload
    Route::post('/upload', [ImageController::class, 'store']);

    // Loyalty & Marketing
    Route::get('/loyalty/points', [LoyaltyController::class, 'index']);
    Route::post('/coupons/verify', [CouponController::class, 'verify']);

    // Referrals
    Route::get('/referrals', [ReferralController::class, 'index']);
    Route::post('/referrals', [ReferralController::class, 'store']);

    // User Orders
    Route::post('/orders', [OrderController::class, 'store'])->middleware('service.enabled');
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Order Tracking
    Route::get('/orders/track/{trackingNumber}', [OrderController::class, 'track']);

    // System Updates
    Route::get('/system-updates', [\App\Http\Controllers\SystemUpdateController::class, 'index']); // Public/Auth
    Route::post('/system-updates', [\App\Http\Controllers\SystemUpdateController::class, 'store']); // Admin
    Route::delete('/system-updates/{id}', [\App\Http\Controllers\SystemUpdateController::class, 'destroy']); // Admin

    // Categories
    Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);

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

    // Image uploads (admin-only uploads grouped below)
    Route::delete('/images', [\App\Http\Controllers\ImageController::class, 'deleteImage']);

    // Shop Admin protected routes
    Route::middleware(['shop.admin', 'service.enabled'])->group(function () {
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

        // Coupons (Shop Admin)
        Route::get('/coupons', [CouponController::class, 'index']);
        Route::post('/coupons', [CouponController::class, 'store']);
        Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);

        // Orders management
        Route::put('/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);
        Route::put('/orders/{id}/assign-delivery', [OrderController::class, 'assignDelivery']);
        Route::get('/shop/orders', [OrderController::class, 'shopOrders']);

        // Products management
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Categories management
        Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store']);
        Route::delete('/categories/{id}', [\App\Http\Controllers\CategoryController::class, 'destroy']);

        // Delivery Persons
        Route::get('/delivery-persons', [\App\Http\Controllers\DeliveryPersonController::class, 'index']);
        Route::post('/delivery-persons', [\App\Http\Controllers\DeliveryPersonController::class, 'store']);
        Route::put('/delivery-persons/{id}/status', [\App\Http\Controllers\DeliveryPersonController::class, 'updateStatus']);
        Route::delete('/delivery-persons/{id}', [\App\Http\Controllers\DeliveryPersonController::class, 'destroy']);

        // Dashboard
        Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

        // Users (for admin)
        Route::get('/users', function (Request $request) {
            return \App\Models\User::where('role', 'customer')->get();
        });

        // Image uploads (admin-only)
        Route::post('/upload/product-image', [\App\Http\Controllers\ImageController::class, 'uploadProductImage']);
        Route::post('/upload/category-image', [\App\Http\Controllers\ImageController::class, 'uploadCategoryImage']);
        Route::post('/upload/shop-logo', [\App\Http\Controllers\ImageController::class, 'uploadShopLogo']);

        // Shop Settings
        Route::get('/shop/settings', [ShopController::class, 'settings']);
        Route::put('/shop/settings', [ShopController::class, 'updateSettings']);
    });

    // Reviews (authenticated)
    Route::post('/reviews', [\App\Http\Controllers\ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [\App\Http\Controllers\ReviewController::class, 'destroy']);

    // Super Admin: Pricing plans and client features
    Route::get('/super_admin/pricing-plans', [SAClientController::class, 'plans']);
    Route::post('/super_admin/clients/{id}/assign-plan', [SAClientController::class, 'assignPlan']);
    Route::get('/super_admin/clients/{id}/features', [SAClientController::class, 'features']);
    Route::get('/super_admin/clients/{id}/sla', [SAClientController::class, 'sla']);

    // Super Admin: Clients management
    Route::get('/super-admin/clients', [SAClientController::class, 'index']);
    Route::post('/super-admin/clients', [SAClientController::class, 'store']);
    Route::put('/super-admin/clients/{id}', [SAClientController::class, 'update']);
    Route::put('/super-admin/clients/{id}/suspend', [SAClientController::class, 'suspend']);
    Route::put('/super-admin/clients/{id}/activate', [SAClientController::class, 'activate']);
    Route::put('/super-admin/clients/{id}/extend', [SAClientController::class, 'extend']);
    Route::delete('/super-admin/clients/{id}', [SAClientController::class, 'destroy']);

    // Super Admin: Onboard shop
    Route::post('/super-admin/onboard-shop', [\App\Http\Controllers\SuperAdmin\OnboardingController::class, 'onboardShop']);
});
