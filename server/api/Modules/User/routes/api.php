<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes for User Module
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your module. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// Protected routes inside "api" namespace middleware (auth+sanctum normally applied globally or in main api.php)
// This will be grouped under `api/` automatically when require'd in the main api.php loop
// or we define standard API group.
Route::group(['middleware' => ['auth:sanctum'], 'prefix' => 'users'], function() {
    Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view');
    Route::post('/', [UserController::class, 'store'])->middleware('permission:users.manage');
    Route::get('/{user}', [UserController::class, 'show'])->middleware('permission:users.view');
    Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:users.manage');
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:users.manage');
});
