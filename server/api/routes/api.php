<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/menus', [App\Http\Controllers\MenuController::class, 'index']);
    
    // Dashboard
    Route::get('/dashboard/stats', [App\Http\Controllers\DashboardController::class, 'stats']);
    Route::get('/dashboard/activities', [App\Http\Controllers\DashboardController::class, 'activities']);
});
