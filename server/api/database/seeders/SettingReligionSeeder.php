<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\App\Models\Setting;

class SettingReligionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $religions = [
            'Islam',
            'Kristen Protestan',
            'Katolik',
            'Hindu',
            'Buddha',
            'Konghucu',
            'Kepercayaan Lainnya'
        ];

        Setting::updateOrCreate(
            ['key' => 'agama'],
            [
                'name' => 'Data Master Agama',
                'type' => 'json',
                'value' => json_encode($religions),
                'group' => 'Master Data',
                'description' => 'Daftar pilihan agama yang diakui dan tersedia di sistem.'
            ]
        );
    }
}
