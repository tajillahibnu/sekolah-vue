<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Siswa\Models\Siswa;

class SiswaFactory extends Factory
{
    protected $model = Siswa::class;

    public function definition(): array
    {
        $gender = $this->faker->randomElement(['L', 'P']);
        $firstName = $gender === 'L' ? $this->faker->firstNameMale : $this->faker->firstNameFemale;
        $lastName = $this->faker->lastName;
        $name = $firstName . ' ' . $lastName;

        return [
            'nis' => $this->faker->unique()->numerify('2026####'),
            'nisn' => $this->faker->unique()->numerify('00########'),
            'name' => $name,
            'email' => $this->faker->unique()->safeEmail,
            'gender' => $gender,
            'birth_place' => $this->faker->city,
            'birth_date' => $this->faker->date('Y-m-d', '-7 years'),
            'religion' => $this->faker->randomElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu']),
            'phone' => $this->faker->phoneNumber,
            'address' => $this->faker->address,
            'status' => 'active',
            'join_date' => now()->subYears(1),
            'previous_school' => 'TK ' . $this->faker->company,
            'entry_score' => $this->faker->randomFloat(2, 70, 100),
            'achievements' => json_encode([$this->faker->sentence]),
            'avatar' => null,
        ];
    }
}
