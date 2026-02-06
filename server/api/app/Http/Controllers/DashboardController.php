<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Traits\ApiResponseTrait;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    public function stats()
    {
        // Mock data matching the frontend expectation
        // Frontend likely expects: { total_students: 120, total_teachers: 15, ... }
        // For now, I'll return a generic structure based on typical dashboard needs.
        // If I can find the frontend interface, I would match it exactly.
        // Assuming typical stats:
        
        $data = [
            'total_students' => 1250,
            'total_teachers' => 85,
            'total_classes' => 42,
            'attendance_rate' => 95.5,
        ];

        return $this->success($data);
    }

    public function activities()
    {
        // Mock activity feed
        $data = [
            [
                'id' => 1,
                'user' => 'Pak Budi',
                'action' => 'Menginput nilai kelas X-A',
                'time' => '10 menit yang lalu'
            ],
            [
                'id' => 2,
                'user' => 'Admin',
                'action' => 'Menambahkan siswa baru',
                'time' => '1 jam yang lalu'
            ],
            [
                'id' => 3,
                'user' => 'Bu Siti',
                'action' => 'Memverifikasi buletin',
                'time' => '2 jam yang lalu'
            ]
        ];

        return $this->success($data);
    }
}
