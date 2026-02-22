<?php

namespace Modules\Siswa\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrangTuaSiswa extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\OrangTuaSiswaFactory::new();
    }

    protected $table = 'orang_tua_siswas';

    protected $fillable = [
        'siswa_id',
        'father_name',
        'father_phone',
        'father_occupation',
        'mother_name',
        'mother_phone',
        'mother_occupation',
        'wali_name',
        'wali_phone',
        'wali_occupation',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }
}
