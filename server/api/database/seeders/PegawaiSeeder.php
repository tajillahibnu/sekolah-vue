<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Pegawai\Models\Pegawai;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class PegawaiSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Load from JSON for backward compatibility / fixed data
        $employeesJsonPath = base_path('../../src/features/employees/data/employees.json');
        if (file_exists($employeesJsonPath)) {
            $employees = json_decode(file_get_contents($employeesJsonPath), true);
            if ($employees) {
                foreach ($employees as $emp) {
                    $this->createEmployeeWithUser($emp);
                }
            }
        }

        // 2. Generate additional random employees using factory
        // Create 10 more teachers
        Pegawai::factory()->count(10)->teacher()->create()->each(function ($pegawai) {
            $this->assignUserAndRole($pegawai, 'guru');
        });

        // Create 5 more staff members
        Pegawai::factory()->count(5)->create(['type' => 'Pegawai'])->each(function ($pegawai) {
            $this->assignUserAndRole($pegawai, 'pegawai');
        });
    }

    /**
     * Helper to create employee from array (JSON)
     */
    private function createEmployeeWithUser(array $emp)
    {
        DB::transaction(function () use ($emp) {
            if (Pegawai::where('nik', $emp['nik'])->exists()) {
                return;
            }

            $user = User::firstOrCreate(
                ['email' => $emp['email']],
                [
                    'name' => $emp['name'],
                    'password' => Hash::make($emp['nik'] ?: 'password123')
                ]
            );

            $roleName = strtolower($emp['type']);
            if (Role::where('name', $roleName)->exists()) {
                $user->assignRole($roleName);
            }

            Pegawai::create([
                'user_id' => $user->id,
                'nip' => $emp['nip'] !== '-' ? $emp['nip'] : null,
                'nik' => $emp['nik'],
                'name' => $emp['name'],
                'email' => $emp['email'],
                'phone' => $emp['phone'] ?? null,
                'gender' => $emp['gender'],
                'birth_place' => $emp['birthPlace'],
                'birth_date' => $emp['birthDate'],
                'religion' => $emp['religion'] ?? null,
                'address' => $emp['address'],
                'education' => $emp['education'],
                'type' => $emp['type'],
                'position' => $emp['position'],
                'status' => $emp['status'],
                'join_date' => $emp['joinDate']
            ]);
        });
    }

    /**
     * Helper to assign user and role for factory-generated pegawai
     */
    private function assignUserAndRole(Pegawai $pegawai, string $roleName)
    {
        $user = User::create([
            'name' => $pegawai->name,
            'email' => $pegawai->email,
            'password' => Hash::make('password123'),
            'primary_role' => $roleName,
            'status' => 'active',
            'join_date' => $pegawai->join_date,
        ]);

        if (Role::where('name', $roleName)->exists()) {
            $user->assignRole($roleName);
        }

        $pegawai->update(['user_id' => $user->id]);
    }
}
