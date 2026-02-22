<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Siswa\Models\OrangTuaSiswa;

class OrangTuaSiswaFactory extends Factory
{
    protected $model = OrangTuaSiswa::class;

    public function definition(): array
    {
        return [
            'father_name' => $this->faker->name('male'),
            'father_phone' => $this->faker->phoneNumber,
            'father_occupation' => $this->faker->jobTitle,
            'mother_name' => $this->faker->name('female'),
            'mother_phone' => $this->faker->phoneNumber,
            'mother_occupation' => $this->faker->jobTitle,
            'wali_name' => $this->faker->optional(0.2)->name,
            'wali_phone' => $this->faker->optional(0.2)->phoneNumber,
            'wali_occupation' => $this->faker->optional(0.2)->jobTitle,
        ];
    }
}
