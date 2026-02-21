<?php

namespace Modules\AcademicYear\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AcademicTermRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'semester' => 'required|in:Ganjil,Genap',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'uts_input_deadline' => 'nullable|date',
            'uas_input_deadline' => 'nullable|date|after_or_equal:uts_input_deadline',
            'report_release_date' => 'nullable|date',
            'is_active' => 'boolean'
        ];
    }
}
