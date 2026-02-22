<?php

namespace Modules\Rombel\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\AcademicYear\Models\AcademicYear;
use Modules\Pegawai\Models\Pegawai;

class Rombel extends Model
{
    use HasFactory;

    protected $table = 'rombels';

    protected $fillable = [
        'tingkat_id',
        'academic_year_id',
        'name',
        'walikelas_id',
    ];

    public function level()
    {
        return $this->belongsTo(Level::class, 'tingkat_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function walikelas()
    {
        return $this->belongsTo(Pegawai::class, 'walikelas_id');
    }

    public function students()
    {
        return $this->belongsToMany(\Modules\Siswa\Models\Siswa::class, 'rombel_siswa', 'rombel_id', 'siswa_id')
                    ->withPivot('academic_year_id')
                    ->withTimestamps();
    }
}
