<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Siswa\Models\Siswa;
use Modules\Rombel\Models\Rombel;
use Modules\Rombel\Models\Level;

class SiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua rombel yang tersedia
        $rombels = Rombel::all();

        if ($rombels->isEmpty()) {
            $this->command->info('Tidak ada rombel ditemukan. Pastikan RombelSeeder sudah dijalankan.');
            return;
        }

        foreach ($rombels as $rombel) {
            // Tentukan jumlah siswa per rombel secara acak (misal 15-25)
            $studentCount = rand(15, 25);
            
            $this->command->info("Membuat {$studentCount} siswa untuk rombel: {$rombel->name}");

            Siswa::factory()
                ->count($studentCount)
                ->create()
                ->each(function ($siswa) use ($rombel) {
                    // Buat akun user untuk siswa
                    $user = \App\Models\User::create([
                        'name' => $siswa->name,
                        'email' => $siswa->email,
                        'password' => bcrypt('password'), // Password default
                        'phone' => $siswa->phone,
                        'primary_role' => 'siswa',
                        'status' => 'active',
                        'join_date' => $siswa->join_date,
                    ]);

                    // Assign role 'siswa'
                    $user->assignRole('siswa');

                    // Hubungkan siswa ke user
                    $siswa->update(['user_id' => $user->id]);

                    // Buat data orang tua otomatis (relation hasOne)
                    $siswa->parents()->create(
                        \Modules\Siswa\Models\OrangTuaSiswa::factory()->make()->toArray()
                    );

                    // Set tingkat_id di tabel siswa sesuai dengan rombel
                    $siswa->update(['tingkat_id' => $rombel->tingkat_id]);

                    // Hubungkan ke rombel
                    $siswa->classrooms()->attach($rombel->id, [
                        'academic_year_id' => $rombel->academic_year_id,
                        'walikelas_id' => $rombel->walikelas_id
                    ]);
                });
        }

        // Buat data siswa PPDB / Belum berkelas (tanpa rombel)
        $this->command->info("Membuat siswa PPDB (Belum Berkelas)...");
        $levels = Level::all();
        foreach ($levels as $level) {
            Siswa::factory()
                ->count(3) // 3 siswa per tingkat yang belum ada kelasnya
                ->create(['tingkat_id' => $level->id])
                ->each(function ($siswa) {
                    // Akun User
                    $user = \App\Models\User::create([
                        'name' => $siswa->name,
                        'email' => $siswa->email,
                        'password' => bcrypt('password'),
                        'primary_role' => 'siswa',
                        'status' => 'active',
                        'join_date' => $siswa->join_date,
                    ]);
                    $user->assignRole('siswa');
                    $siswa->update(['user_id' => $user->id]);

                    // Data Orang Tua
                    $siswa->parents()->create(
                        \Modules\Siswa\Models\OrangTuaSiswa::factory()->make()->toArray()
                    );
                });
        }

        $this->command->info('SiswaSeeder berhasil dijalankan.');
    }
}
