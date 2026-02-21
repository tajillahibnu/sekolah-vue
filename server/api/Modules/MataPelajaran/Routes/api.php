<?php

use Illuminate\Support\Facades\Route;
use Modules\MataPelajaran\Http\Controllers\Api\MataPelajaranController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('mata-pelajaran', MataPelajaranController::class);
});
