<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\AcademicYear\Models\AcademicYear;

class AcademicYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Tahun Pelajaran 2024/2025
        $year1 = AcademicYear::create([
            'name' => '2024/2025',
        ]);
        
        $year1->terms()->createMany([
            [
                'semester' => 'Ganjil',
                'start_date' => '2024-07-15',
                'end_date' => '2024-12-20',
                'uts_input_deadline' => '2024-10-15 23:59:00',
                'uas_input_deadline' => '2024-12-15 23:59:00',
                'report_release_date' => '2024-12-21 08:00:00',
                'is_active' => false,
            ],
            [
                'semester' => 'Genap',
                'start_date' => '2025-01-06',
                'end_date' => '2025-06-20',
                'uts_input_deadline' => '2025-03-30 23:59:00',
                'uas_input_deadline' => '2025-06-15 23:59:00',
                'report_release_date' => '2025-06-21 08:00:00',
                'is_active' => false,
            ]
        ]);

        // 2. Tahun Pelajaran 2025/2026 (Aktif di Ganjil)
        $year2 = AcademicYear::create([
            'name' => '2025/2026',
        ]);

        $year2->terms()->createMany([
            [
                'semester' => 'Ganjil',
                'start_date' => '2025-07-14',
                'end_date' => '2025-12-19',
                'uts_input_deadline' => '2025-10-15 23:59:00',
                'uas_input_deadline' => '2025-12-12 23:59:00',
                'report_release_date' => '2025-12-20 08:00:00',
                'is_active' => true, // Default aktif
            ],
            [
                'semester' => 'Genap',
                'start_date' => '2026-01-05',
                'end_date' => '2026-06-19',
                'uts_input_deadline' => '2026-03-30 23:59:00',
                'uas_input_deadline' => '2026-06-15 23:59:00',
                'report_release_date' => '2026-06-20 08:00:00',
                'is_active' => false,
            ]
        ]);
    }
}
