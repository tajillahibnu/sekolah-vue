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

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
