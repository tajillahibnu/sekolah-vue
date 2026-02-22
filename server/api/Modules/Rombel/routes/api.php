<?php

use Illuminate\Support\Facades\Route;
use Modules\Rombel\Http\Controllers\RombelController;
use Modules\Rombel\Http\Controllers\LevelController;

Route::get('rombels', [RombelController::class, 'index']);
Route::get('levels', [LevelController::class, 'index']);
Route::post('rombels/{rombel}/assign-students', [RombelController::class, 'assignStudents']);
