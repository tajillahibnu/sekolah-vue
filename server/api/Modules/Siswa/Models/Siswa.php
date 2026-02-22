<?php

namespace Modules\Siswa\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Rombel\Models\Rombel;

class Siswa extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\SiswaFactory::new();
    }

    protected $table = 'siswas';

    protected $fillable = [
        'user_id',
        'tingkat_id',
        'nis',
        'nisn',
        'name',
        'email',
        'gender',
        'birth_place',
        'birth_date',
        'religion',
        'phone',
        'address',
        'status',
        'join_date',
        'previous_school',
        'entry_score',
        'achievements',
        'avatar',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
        'achievements' => 'array',
        'entry_score' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function level()
    {
        return $this->belongsTo(\Modules\Rombel\Models\Level::class, 'tingkat_id');
    }

    public function parents()
    {
        return $this->hasOne(OrangTuaSiswa::class, 'siswa_id');
    }

    // Relasi historis riwayat kelas siswa (pivot table)
    public function classrooms()
    {
        return $this->belongsToMany(Rombel::class, 'rombel_siswa', 'siswa_id', 'rombel_id')
                    ->withPivot('academic_year_id', 'walikelas_id')
                    ->withTimestamps();
    }
}
