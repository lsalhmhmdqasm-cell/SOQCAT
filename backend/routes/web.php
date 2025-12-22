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

Route::get('/setup-db', function () {
    // Security check: Must provide the correct APP_KEY in the URL
    if (request('key') !== config('app.key')) {
        abort(403, 'Unauthorized: Invalid Key');
    }

    try {
        // Run migrations and seeds
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', [
            '--seed' => true,
            '--force' => true
        ]);
        
        // Link storage
        \Illuminate\Support\Facades\Artisan::call('storage:link');
        
        return response()->json([
            'message' => 'Database Setup Completed Successfully!',
            'migration_output' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});
