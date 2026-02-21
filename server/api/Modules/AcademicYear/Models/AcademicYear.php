<?php

namespace Modules\AcademicYear\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    /**
     * Relasi ke sesi term/semester
     */
    public function terms()
    {
        return $this->hasMany(AcademicTerm::class);
    }
}
