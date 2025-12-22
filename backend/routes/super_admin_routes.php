<?php

use App\Http\Controllers\SuperAdmin\ClientController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\SupportController;
use App\Http\Controllers\SuperAdmin\UpdateController;
use Illuminate\Support\Facades\Route;

// Super Admin Routes (protected)
Route::middleware(['auth:sanctum'])->prefix('super-admin')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/monitoring/metrics', [DashboardController::class, 'metrics']);

    // Clients Management
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
    Route::put('/clients/{id}/suspend', [ClientController::class, 'suspend']);
    Route::put('/clients/{id}/activate', [ClientController::class, 'activate']);
    Route::put('/clients/{id}/extend', [ClientController::class, 'extend']);

    // Support Tickets
    Route::get('/tickets', [SupportController::class, 'index']);
    Route::get('/tickets/{id}', [SupportController::class, 'show']);
    Route::post('/tickets/{id}/reply', [SupportController::class, 'reply']);
    Route::put('/tickets/{id}/status', [SupportController::class, 'updateStatus']);
    Route::put('/tickets/{id}/assign', [SupportController::class, 'assign']);

    // System Updates
    Route::get('/updates', [UpdateController::class, 'index']);
    Route::post('/updates', [UpdateController::class, 'store']);
    Route::post('/updates/{id}/deploy', [UpdateController::class, 'deploy']);
    Route::get('/updates/{id}/stats', [UpdateController::class, 'getStats']);
});
