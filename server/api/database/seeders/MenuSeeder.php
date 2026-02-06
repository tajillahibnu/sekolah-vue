<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            [
                'name' => 'Dashboard',
                'icon_menu' => 'HomeIcon',
                'to' => '/admin/dashboard',
                'permission_name' => null, // Visible to all authenticated users
                'order' => 1,
            ],
            [
                'name' => 'Akademik',
                'icon_menu' => 'AcademicCapIcon',
                'permission_name' => 'academic.manage',
                'order' => 2,
                'children' => [
                    ['name' => 'Daftar Kelas', 'to' => '/admin/academic/classes', 'order' => 1],
                    ['name' => 'Mata Pelajaran', 'to' => '/admin/academic/subjects', 'order' => 2],
                    ['name' => 'Tahun Ajaran', 'to' => '/admin/academic/school-year', 'order' => 3],
                ]
            ],
            [
                'name' => 'Kesiswaan',
                'icon_menu' => 'UserGroupIcon',
                'permission_name' => 'students.view', 
                'order' => 3,
                'children' => [
                    ['name' => 'Data Siswa', 'to' => '/admin/students', 'order' => 1, 'permission_name' => 'students.view'],
                    ['name' => 'Data Pegawai', 'to' => '/admin/employees', 'order' => 2, 'permission_name' => 'employees.view'],
                    ['name' => 'Pelanggaran', 'to' => '/admin/violations', 'order' => 3, 'permission_name' => 'violations.view'],
                ]
            ],
            [
                'name' => 'Mengajar',
                'icon_menu' => 'AcademicCapIcon',
                'permission_name' => 'elearning.teach',
                'order' => 4,
                'children' => [
                    ['name' => 'Jadwal Mengajar', 'to' => '/admin/kbm-schedule/teacher', 'order' => 1],
                    ['name' => 'Kelas Saya', 'to' => '/admin/elearning/teach', 'order' => 2],
                ]
            ],
            [
                'name' => 'Pembelajaran',
                'icon_menu' => 'BookOpenIcon',
                'permission_name' => 'elearning.learn',
                'order' => 5,
                'children' => [
                    ['name' => 'Jadwal Pelajaran', 'to' => '/admin/kbm-schedule/student', 'order' => 1],
                    ['name' => 'Kursus Saya', 'to' => '/admin/elearning/learn', 'order' => 2],
                ]
            ],
            [
                'name' => 'Absensi',
                'icon_menu' => 'ClipboardDocumentListIcon',
                'to' => '/admin/attendance',
                'permission_name' => 'attendance.view',
                'order' => 6,
            ],
            [
                'name' => 'Ujian',
                'icon_menu' => 'PencilSquareIcon',
                'to' => '/admin/tka/student/list',
                'permission_name' => 'elearning.learn',
                'order' => 7,
            ],
            [
                'name' => 'Tes & Asesmen',
                'icon_menu' => 'ClipboardDocumentCheckIcon',
                'permission_name' => 'tka.manage',
                'order' => 8,
                'children' => [
                    ['name' => 'Bank Soal', 'to' => '/admin/tka/bank-soal', 'order' => 1],
                    ['name' => 'Jadwal Tes', 'to' => '/admin/tka/list', 'order' => 2],
                ]
            ],
            [
                'name' => 'Buletin Sekolah',
                'icon_menu' => 'BookOpenIcon',
                'permission_name' => 'bulletin.view',
                'order' => 9,
                'children' => [
                    ['name' => 'Jelajah Buletin', 'to' => '/admin/bulletins', 'order' => 1],
                    ['name' => 'Kontribusi Saya', 'to' => '/admin/bulletins/my-bulletins', 'order' => 2],
                    ['name' => 'Verifikasi Konten', 'to' => '/admin/bulletins/verify', 'order' => 3, 'permission_name' => 'bulletin.verify'],
                ]
            ],
            [
                'name' => 'E-Raport',
                'icon_menu' => 'DocumentChartBarIcon',
                'permission_name' => 'academic.manage',
                'order' => 10,
                'children' => [
                    ['name' => 'Dashboard', 'to' => '/admin/raport/dashboard', 'order' => 1],
                    ['name' => 'Input Nilai', 'to' => '/admin/raport/entries', 'order' => 2],
                    ['name' => 'Cetak Raport', 'to' => '/admin/raport/print', 'order' => 3],
                ]
            ],
            [
                'name' => 'Pengaturan',
                'icon_menu' => 'Cog6ToothIcon',
                'permission_name' => 'settings.manage',
                'order' => 11,
                'children' => [
                    ['name' => 'Pengguna', 'to' => '/admin/settings/users', 'order' => 1],
                    ['name' => 'Sekolah', 'to' => '/admin/settings/school', 'order' => 2],
                    ['name' => 'System Logs', 'to' => '/admin/settings/logs', 'order' => 3, 'permission_name' => 'roles.manage'],
                ]
            ],
            [
                'name' => 'App Management',
                'icon_menu' => 'CommandLineIcon',
                'permission_name' => 'roles.manage',
                'order' => 12,
                'children' => [
                    ['name' => 'Roles & Permissions', 'to' => '/admin/app/roles', 'order' => 1],
                    ['name' => 'Menu Management', 'to' => '/admin/app/menus', 'order' => 2],
                ]
            ],
        ];

        $this->createMenus($menus);
    }

    private function createMenus(array $menus, $parentId = null)
    {
        foreach ($menus as $menuData) {
            $children = $menuData['children'] ?? [];
            unset($menuData['children']);

            $menuData['parent_id'] = $parentId;
            $menu = Menu::create($menuData);

            if (!empty($children)) {
                $this->createMenus($children, $menu->id);
            }
        }
    }
}
