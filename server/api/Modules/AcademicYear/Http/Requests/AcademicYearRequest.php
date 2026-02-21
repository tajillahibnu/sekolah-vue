<?php

namespace Modules\AcademicYear\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AcademicYearRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:20', // Contoh 2024/2025
            'is_active' => 'boolean'
        ];
    }
}
