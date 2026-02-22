<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            ['name' => '1', 'description' => 'Kelas Satu', 'created_at' => now(), 'updated_at' => now()],
            ['name' => '2', 'description' => 'Kelas Dua', 'created_at' => now(), 'updated_at' => now()],
            ['name' => '3', 'description' => 'Kelas Tiga', 'created_at' => now(), 'updated_at' => now()],
            ['name' => '4', 'description' => 'Kelas Empat', 'created_at' => now(), 'updated_at' => now()],
            ['name' => '5', 'description' => 'Kelas Lima', 'created_at' => now(), 'updated_at' => now()],
            ['name' => '6', 'description' => 'Kelas Enam', 'created_at' => now(), 'updated_at' => now()],
        ];

        \Illuminate\Support\Facades\DB::table('tingkats')->insert($levels);
    }
}
