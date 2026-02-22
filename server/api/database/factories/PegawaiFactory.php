<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Pegawai\Models\Pegawai;

class PegawaiFactory extends Factory
{
    protected $model = Pegawai::class;

    public function definition(): array
    {
        $gender = $this->faker->randomElement(['Laki-laki', 'Perempuan']);
        
        return [
            'user_id' => null, // Set in seeder
            'nip' => $this->faker->unique()->numerify('199#########'),
            'nik' => $this->faker->unique()->numerify('320##########'),
            'name' => $this->faker->name($gender === 'Laki-laki' ? 'male' : 'female'),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'gender' => $gender,
            'birth_place' => $this->faker->city(),
            'birth_date' => $this->faker->date('Y-m-d', '-30 years'),
            'religion' => $this->faker->randomElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu']),
            'address' => $this->faker->address(),
            'education' => $this->faker->randomElement(['S1 Pendidikan', 'S2 Manajemen', 'S1 Teknik', 'Diploma 3']),
            'type' => $this->faker->randomElement(['Guru', 'Pegawai']),
            'position' => $this->faker->jobTitle(),
            'status' => 'Aktif',
            'join_date' => $this->faker->date('Y-m-d', '-5 years'),
        ];
    }

    /**
     * State for Guru role.
     */
    public function teacher(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'Guru',
            'position' => 'Guru Mata Pelajaran',
        ]);
    }
}
