<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// --- PRODUCTION SETUP HELPER (Temporary) ---
Route::get('/run-production-seed', function () {
    // Simple protection
    if (request('secret') !== 'secret123') {
        abort(403, 'Unauthorized access.');
    }

    try {
        // 0. Run Migrations FIRST (Build Tables)
        \Illuminate\Support\Facades\Artisan::call('migrate', [
            '--force' => true,
        ]);
        $migrateOutput = \Illuminate\Support\Facades\Artisan::output();

        // 1. Create Shop #1
        \Illuminate\Support\Facades\Artisan::call('db:seed', [
            '--class' => 'ProductionShopSeeder',
            '--force' => true,
        ]);
        $shopOutput = \Illuminate\Support\Facades\Artisan::output();

        // 2. Create Super Admin
        \Illuminate\Support\Facades\Artisan::call('db:seed', [
            '--class' => 'SuperAdminSeeder',
            '--force' => true,
        ]);
        $adminOutput = \Illuminate\Support\Facades\Artisan::output();

        return "<h1>Setup Completed Successfully!</h1><pre>Migrations:\n$migrateOutput\n\nShop Seeder:\n$shopOutput\n\nAdmin Seeder:\n$adminOutput</pre>";

    } catch (\Exception $e) {
        return '<h1>Error!</h1><pre>'.$e->getMessage().'</pre>';
    }
});
// -------------------------------------------

Route::get('/super-admin/onboard-shop', function () {
    return view('super_admin.onboard_shop');
});

if (app()->environment('local')) {
    Route::get('/setup-db', function () {
        if (request('key') !== config('app.key')) {
            abort(403, 'Unauthorized: Invalid Key');
        }

        try {
            \Illuminate\Support\Facades\Artisan::call('migrate:fresh', [
                '--seed' => true,
                '--force' => true,
            ]);

            \Illuminate\Support\Facades\Artisan::call('storage:link');

            return response()->json([
                'message' => 'Database Setup Completed Successfully!',
                'migration_output' => \Illuminate\Support\Facades\Artisan::output(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    });

    Route::get('/dev/token', function () {
        $user = \App\Models\User::where('email', 'admin@qatshop.com')->first();
        if (! $user) {
            return response()->json(['error' => 'Super Admin not found'], 404);
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['access_token' => $token, 'token_type' => 'Bearer']);
    });

    Route::get('/dev/users', function () {
        return \App\Models\User::select('id', 'name', 'email', 'phone', 'role')->get();
    });
}
