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
        $employees = json_decode(file_get_contents(base_path('../../src/features/employees/data/employees.json')), true);

        if (!$employees) return;

        foreach ($employees as $emp) {
            DB::transaction(function () use ($emp) {
                // Ensure email and nik uniqueness locally or check first
                if (Pegawai::where('nik', $emp['nik'])->exists()) {
                    return;
                }

                // 1. Create User
                $password = $emp['nik'] ?: 'password123';
                $user = User::firstOrCreate(
                    ['email' => $emp['email']],
                    [
                        'name' => $emp['name'],
                        'password' => Hash::make($password)
                    ]
                );

                // Assign role based on 'type'
                $roleName = strtolower($emp['type']); // 'guru' or 'pegawai'
                if (Role::where('name', $roleName)->exists()) {
                    $user->assignRole($roleName);
                }

                // 2. Create Pegawai
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
    }
}
