<?php

use Illuminate\Support\Facades\Route;
use Modules\Siswa\Http\Controllers\SiswaController;

Route::apiResource('siswas', SiswaController::class);
