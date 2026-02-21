<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\DashboardController;
use Modules\App\Http\Controllers\Api\RoleController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [UserController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/menus', [MenuController::class, 'index']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/activities', [DashboardController::class, 'activities']);
    
    // Automatically load API routes from all Modules
    // Pattern: Modules/{ModuleName}/routes/api.php
    foreach (glob(base_path('Modules/*/routes/api.php')) as $moduleRoute) {
        require $moduleRoute;
    }
});
