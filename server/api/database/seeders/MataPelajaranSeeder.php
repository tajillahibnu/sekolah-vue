<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MataPelajaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mataPelajaran = [
            ['nama' => 'Matematika', 'kode' => 'MATH', 'kategori' => 'Umum', 'tipe' => 'Teori'],
            ['nama' => 'Bahasa Inggris', 'kode' => 'ENG', 'kategori' => 'Umum', 'tipe' => 'Campuran'],
            ['nama' => 'Bahasa Indonesia', 'kode' => 'IND', 'kategori' => 'Umum', 'tipe' => 'Teori'],
            ['nama' => 'Ilmu Pengetahuan Alam', 'kode' => 'IPA', 'kategori' => 'Umum', 'tipe' => 'Campuran'],
            ['nama' => 'Ilmu Pengetahuan Sosial', 'kode' => 'IPS', 'kategori' => 'Umum', 'tipe' => 'Teori'],
            ['nama' => 'Pendidikan Jasmani', 'kode' => 'PJOK', 'kategori' => 'Umum', 'tipe' => 'Praktik'],
            ['nama' => 'Seni Budaya', 'kode' => 'SENI', 'kategori' => 'Umum', 'tipe' => 'Campuran'],
            ['nama' => 'Pendidikan Agama', 'kode' => 'AGMA', 'kategori' => 'Umum', 'tipe' => 'Teori'],
            ['nama' => 'Informatika', 'kode' => 'INFO', 'kategori' => 'Kejuruan', 'tipe' => 'Campuran'],
        ];

        foreach ($mataPelajaran as $mp) {
            \Modules\MataPelajaran\Models\MataPelajaran::updateOrCreate(['kode' => $mp['kode']], $mp);
        }
    }
}
