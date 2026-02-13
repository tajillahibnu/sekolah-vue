<?php

use Illuminate\Support\Facades\Route;
use Modules\App\Http\Controllers\Api\RoleController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Roles & Permissions
    Route::apiResource('roles', RoleController::class);
    Route::get('/permissions', [RoleController::class, 'permissions']);
});
