<?php

use Illuminate\Support\Facades\Route;
use Modules\Pegawai\Http\Controllers\Api\PegawaiController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('pegawai/{id}/photo', [PegawaiController::class, 'uploadPhoto']);
    Route::apiResource('pegawai', PegawaiController::class);
});
