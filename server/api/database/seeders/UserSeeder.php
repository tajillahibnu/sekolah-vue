<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Superadmin
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@sekolahbeta.com'],
            ['name' => 'Superadmin', 'password' => bcrypt('password')]
        );
        $superadmin->syncRoles(['superadmin']);

        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@sekolahbeta.com'],
            ['name' => 'Admin Sekolah', 'password' => bcrypt('password')]
        );
        $admin->syncRoles(['superadmin', 'admin', 'guru', 'siswa', 'kesiswaan', 'kurikulum', 'walikelas']);

        // Guru Kesiswaan
        $guruKesiswaan = User::firstOrCreate(
            ['email' => 'guru.kesiswaan@sekolahbeta.com'],
            ['name' => 'Guru Kesiswaan', 'password' => bcrypt('password')]
        );
        $guruKesiswaan->syncRoles(['guru', 'kesiswaan']);

        // Siswa
        $siswa = User::firstOrCreate(
            ['email' => 'siswa@sekolahbeta.com'],
            ['name' => 'Siswa Teladan', 'password' => bcrypt('password')]
        );
        $siswa->syncRoles(['siswa']);

        // Walikelas
        $walikelas = User::firstOrCreate(
            ['email' => 'walikelas@sekolahbeta.com'],
            ['name' => 'Pak Wali', 'password' => bcrypt('password')]
        );
        $walikelas->syncRoles(['walikelas']);

        // Kurikulum
        $kurikulum = User::firstOrCreate(
            ['email' => 'kurikulum@sekolahbeta.com'],
            ['name' => 'Bu Kurikulum', 'password' => bcrypt('password')]
        );
        $kurikulum->syncRoles(['kurikulum']);
    }
}
