<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $usersList = [
            [
                'email' => 'superadmin@sekolahbeta.com',
                'name' => 'Superadmin',
                'primary_role' => 'Karyawan',
                'roles' => ['superadmin']
            ],
            [
                'email' => 'admin@sekolahbeta.com',
                'name' => 'Admin Sekolah',
                'primary_role' => 'Karyawan',
                'roles' => ['superadmin', 'admin', 'guru', 'siswa', 'kesiswaan', 'kurikulum', 'walikelas']
            ],
            [
                'email' => 'guru.kesiswaan@sekolahbeta.com',
                'name' => 'Guru Kesiswaan',
                'primary_role' => 'Guru',
                'roles' => ['guru', 'kesiswaan']
            ],
            [
                'email' => 'siswa@sekolahbeta.com',
                'name' => 'Siswa Teladan',
                'primary_role' => 'Siswa',
                'roles' => ['siswa']
            ],
            [
                'email' => 'walikelas@sekolahbeta.com',
                'name' => 'Pak Wali',
                'primary_role' => 'Guru',
                'roles' => ['walikelas']
            ],
            [
                'email' => 'kurikulum@sekolahbeta.com',
                'name' => 'Bu Kurikulum',
                'primary_role' => 'Guru',
                'roles' => ['kurikulum']
            ],
        ];

        foreach ($usersList as $userData) {
            $user = User::where('email', $userData['email'])->first();

            if (!$user) {
                $user = User::factory()->create([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'primary_role' => $userData['primary_role']
                ]);
            }
            
            $user->syncRoles($userData['roles']);
        }

        // Tambahkan dummy users rendom
        // Misal 20 siswa, 5 guru, dan 5 karyawan tambahan
        User::factory()->count(20)->create(['primary_role' => 'Siswa'])->each(function ($u) { $u->syncRoles(['siswa']); });
        User::factory()->count(5)->create(['primary_role' => 'Guru'])->each(function ($u) { $u->syncRoles(['guru']); });
        User::factory()->count(5)->create(['primary_role' => 'Karyawan']);
    }
}
