<?php

namespace Modules\Pegawai\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pegawai extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nip',
        'nik',
        'name',
        'email',
        'phone',
        'gender',
        'birth_place',
        'birth_date',
        'religion',
        'address',
        'education',
        'type',
        'position',
        'status',
        'join_date',
    ];

    protected static function newFactory()
    {
        return \Database\Factories\PegawaiFactory::new();
    }

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function classrooms()
    {
        return $this->hasMany(\Modules\Rombel\Models\Rombel::class, 'homeroom_teacher_id');
    }
}
