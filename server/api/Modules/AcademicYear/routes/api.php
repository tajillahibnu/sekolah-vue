<?php

use Illuminate\Support\Facades\Route;
use Modules\AcademicYear\Http\Controllers\Api\AcademicYearController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/academic-years/active', [AcademicYearController::class, 'getActive']);
    
    // Set Active kini mengarah ke sesi spesifik (Terms)
    Route::post('/academic-terms/{id}/set-active', [AcademicYearController::class, 'setTermActive']);
    Route::post('/academic-years/{id}/terms', [AcademicYearController::class, 'storeTerm']);
    
    // Operasi CRUD Induk Tahun
    Route::apiResource('academic-years', AcademicYearController::class);
});
