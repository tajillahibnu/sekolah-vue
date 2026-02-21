<?php

namespace Modules\MataPelajaran\Models;

use Illuminate\Database\Eloquent\Model;

class MataPelajaran extends Model
{
    protected $table = 'mata_pelajaran';

    protected $fillable = [
        'nama',
        'kode',
        'deskripsi',
        'kategori',
        'tipe',
        'is_aktif',
    ];
}
