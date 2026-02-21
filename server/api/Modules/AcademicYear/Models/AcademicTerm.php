<?php

namespace Modules\AcademicYear\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicTerm extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id',
        'semester',
        'start_date',
        'end_date',
        'uts_input_deadline',
        'uas_input_deadline',
        'report_release_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'uts_input_deadline' => 'datetime',
        'uas_input_deadline' => 'datetime',
        'report_release_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
