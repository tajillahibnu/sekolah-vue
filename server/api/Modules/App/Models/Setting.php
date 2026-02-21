<?php

namespace Modules\App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'value',
        'type',
        'group',
        'description'
    ];

    /**
     * Otomatis melakukan konversi Array to JSON dan sebaliknya bila tipenya json.
     * Menggunakan accessor/mutator atau override casting dinamis.
     */
    protected function casts(): array
    {
        return [
            // Kita tidak selalu meng-cast 'value' sebagai json karena bisa saja string biasa.
            // Namun, untuk lebih aman, kita biarkan saja sebagai string, atau kita tangani 
            // di accessor khusus.
        ];
    }
    
    // Asesor untuk value dinamis bergantung dari kolom type
    public function getParsedValueAttribute()
    {
        if ($this->type === 'json') {
            return json_decode($this->value, true);
        }
        if ($this->type === 'boolean') {
            return filter_var($this->value, FILTER_VALIDATE_BOOLEAN);
        }
        if ($this->type === 'integer') {
            return (int) $this->value;
        }
        
        return $this->value;
    }
}
