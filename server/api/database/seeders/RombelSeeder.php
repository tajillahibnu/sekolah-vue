<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RombelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classrooms = [];
        $academicYearId = 1;

        // Ambil beberapa ID pegawai (Hanya GURU) untuk dijadikan wali kelas
        $pegawaiIds = \Modules\Pegawai\Models\Pegawai::where('type', 'Guru')->pluck('id')->toArray();

        // For each level 1 to 6, create classes A and B
        for ($levelId = 1; $levelId <= 6; $levelId++) {
            $classrooms[] = [
                'tingkat_id' => $levelId,
                'academic_year_id' => $academicYearId,
                'name' => 'A',
                'walikelas_id' => !empty($pegawaiIds) ? $pegawaiIds[array_rand($pegawaiIds)] : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $classrooms[] = [
                'tingkat_id' => $levelId,
                'academic_year_id' => $academicYearId,
                'name' => 'B',
                'walikelas_id' => !empty($pegawaiIds) ? $pegawaiIds[array_rand($pegawaiIds)] : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        \Illuminate\Support\Facades\DB::table('rombels')->insert($classrooms);
    }
}
