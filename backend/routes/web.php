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
