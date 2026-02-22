<?php

namespace Modules\Rombel\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Level extends Model
{
    use HasFactory;

    protected $table = 'tingkats';

    protected $fillable = [
        'name',
        'description',
    ];

    public function getNameAttribute($value)
    {
        $romanMap = [
            '1' => 'I',
            '2' => 'II',
            '3' => 'III',
            '4' => 'IV',
            '5' => 'V',
            '6' => 'VI',
        ];

        return isset($romanMap[$value]) ? 'Tingkat ' . $romanMap[$value] : $value;
    }

    public function classrooms()
    {
        return $this->hasMany(Rombel::class, 'tingkat_id');
    }
}
