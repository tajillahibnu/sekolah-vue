<?php

use Illuminate\Support\Facades\Route;
use Modules\App\Http\Controllers\Api\RoleController;
use Modules\App\Http\Controllers\Api\SettingController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Roles & Permissions
    Route::apiResource('roles', RoleController::class);
    Route::get('/permissions', [RoleController::class, 'permissions']);
    
    // App Settings
    Route::apiResource('settings', SettingController::class);
});
