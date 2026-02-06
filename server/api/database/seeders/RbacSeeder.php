<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\Menu;
use App\Models\User;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Roles
        // Spatie uses 'guard_name' => 'web' (or 'api') by default. 
        // We will stick to defaults unless we need specific guards.
        $roles = [
            'superadmin',
            'admin',
            'guru',
            'siswa',
            'kesiswaan',
            'kurikulum',
            'walikelas',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // 2. Create Permissions
        $permissions = [
            'roles.manage',
            'users.view',
            'settings.manage',
            'bulletin.view',
            'bulletin.submit',
            'bulletin.verify',
            'elearning.teach',
            'elearning.learn',
            'elearning.monitor',
            'tka.manage',
            'tka.monitor',
            'tka.verify',
            'attendance.view',
            'classes.view',
            'classes.manage',
            'academic.manage',
            'subjects.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // 3. Assign Permissions to Roles
        $superadminRole = Role::findByName('superadmin');
        $adminRole = Role::findByName('admin');
        $guruRole = Role::findByName('guru');
        $siswaRole = Role::findByName('siswa');
        
        // Superadmin and Admin get all permissions
        $superadminRole->givePermissionTo(Permission::all());
        $adminRole->givePermissionTo(Permission::all());

        // Guru Permissions
        $guruRole->givePermissionTo([
            'elearning.teach', 'attendance.view', 'bulletin.submit', 'bulletin.view'
        ]);

        // Siswa Permissions
        $siswaRole->givePermissionTo([
            'elearning.learn', 'bulletin.view'
        ]);

        // 4. Create Menus
        $this->createMenus();

        // 5. Create Specific Users and Assign Roles
        
        // Superadmin
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@sekolahbeta.com'],
            ['name' => 'Superadmin', 'password' => bcrypt('password')]
        );
        $superadmin->assignRole('superadmin');

        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@sekolahbeta.com'],
            ['name' => 'Admin Sekolah', 'password' => bcrypt('password')]
        );
        // Assign ALL roles to admin for testing switcher
        $admin->syncRoles($roles);

        // Guru Kesiswaan (Guru + Kesiswaan)
        $guruKesiswaan = User::firstOrCreate(
            ['email' => 'guru.kesiswaan@sekolahbeta.com'],
            ['name' => 'Guru Kesiswaan', 'password' => bcrypt('password')]
        );
        $guruKesiswaan->assignRole(['guru', 'kesiswaan']);

        // Siswa
        $siswa = User::firstOrCreate(
            ['email' => 'siswa@sekolahbeta.com'],
            ['name' => 'Siswa Teladan', 'password' => bcrypt('password')]
        );
        $siswa->assignRole('siswa');
    }

    private function createMenus()
    {
        // Superadmin Menu (Clone Admin for now or add more)
        Menu::updateOrCreate(['role_name' => 'superadmin'], [
            'items' => [
                [
                    'label' => 'Dashboard',
                    'icon' => 'HomeIcon',
                    'to' => '/admin/dashboard'
                ],
                [
                    'label' => 'Akademik',
                    'icon' => 'AcademicCapIcon',
                    'children' => [
                        ['label' => 'Daftar Kelas', 'to' => '/admin/academic/classes'],
                        ['label' => 'Mata Pelajaran', 'to' => '/admin/academic/subjects'],
                        ['label' => 'Tahun Ajaran', 'to' => '/admin/academic/school-year'],
                    ]
                ],
                 [
                    'label' => 'Kesiswaan',
                    'icon' => 'UserGroupIcon',
                     'children' => [
                        ['label' => 'Data Siswa', 'to' => '/admin/students'],
                        ['label' => 'Data Pegawai', 'to' => '/admin/employees'],
                     ]
                ],
                [
                     'label' => 'Tes & Asesmen',
                     'icon' => 'ClipboardDocumentCheckIcon',
                     'children' => [
                        ['label' => 'Bank Soal', 'to' => '/admin/tka/bank-soal'],
                        ['label' => 'Jadwal Tes', 'to' => '/admin/tka/list'],
                     ]
                ],
                [
                    'label' => 'Pengaturan',
                    'icon' => 'Cog6ToothIcon',
                    'children' => [
                        ['label' => 'Pengguna', 'to' => '/admin/settings/users'],
                        ['label' => 'Sekolah', 'to' => '/admin/settings/school'],
                        ['label' => 'System Logs', 'to' => '/admin/settings/logs'], // Extra for superadmin
                    ]
                ]
            ]
        ]);

        // Admin Menu
        Menu::updateOrCreate(['role_name' => 'admin'], [
            'items' => [
                [
                    'label' => 'Dashboard',
                    'icon' => 'HomeIcon',
                    'to' => '/admin/dashboard'
                ],
                [
                    'label' => 'Akademik',
                    'icon' => 'AcademicCapIcon',
                    'children' => [
                        ['label' => 'Daftar Kelas', 'to' => '/admin/academic/classes'],
                        ['label' => 'Mata Pelajaran', 'to' => '/admin/academic/subjects'],
                        ['label' => 'Tahun Ajaran', 'to' => '/admin/academic/school-year'],
                    ]
                ],
                 [
                    'label' => 'Kesiswaan',
                    'icon' => 'UserGroupIcon',
                     'children' => [
                        ['label' => 'Data Siswa', 'to' => '/admin/students'],
                        ['label' => 'Data Pegawai', 'to' => '/admin/employees'],
                     ]
                ],
                [
                     'label' => 'Tes & Asesmen',
                     'icon' => 'ClipboardDocumentCheckIcon',
                     'children' => [
                        ['label' => 'Bank Soal', 'to' => '/admin/tka/bank-soal'],
                        ['label' => 'Jadwal Tes', 'to' => '/admin/tka/list'],
                     ]
                ],
                [
                    'label' => 'Pengaturan',
                    'icon' => 'Cog6ToothIcon',
                    'children' => [
                        ['label' => 'Pengguna', 'to' => '/admin/settings/users'],
                        ['label' => 'Sekolah', 'to' => '/admin/settings/school'],
                    ]
                ]
            ]
        ]);

        // Guru Menu
        Menu::updateOrCreate(['role_name' => 'guru'], [
            'items' => [
                 [
                    'label' => 'Dashboard',
                    'icon' => 'HomeIcon',
                    'to' => '/admin/dashboard'
                ],
                [
                    'label' => 'Mengajar',
                    'icon' => 'AcademicCapIcon',
                    'children' => [
                         ['label' => 'Jadwal Mengajar', 'to' => '/admin/kbm-schedule/teacher'],
                         ['label' => 'Kelas Saya', 'to' => '/admin/elearning/teach'],
                    ]
                ],
                [
                    'label' => 'Absensi',
                    'icon' => 'ClipboardDocumentListIcon',
                    'to' => '/admin/attendance'
                ]
            ]
        ]);

        // Kesiswaan Menu (Combined with Guru usually, but if logged in as just Kesiswaan or distinct menu)
        // Since we assigned both roles, they might get both menus if merged, 
        // OR the frontend only picks the "Active Role".
        // Let's create a menu for Kesiswaan specifically.
        Menu::updateOrCreate(['role_name' => 'kesiswaan'], [
            'items' => [
                 [
                    'label' => 'Dashboard',
                    'icon' => 'HomeIcon',
                    'to' => '/admin/dashboard'
                ],
                [
                    'label' => 'Kesiswaan',
                    'icon' => 'UserGroupIcon',
                     'children' => [
                        ['label' => 'Data Siswa', 'to' => '/admin/students'],
                        ['label' => 'Pelanggaran', 'to' => '/admin/violations'],
                     ]
                ],
            ]
        ]);

        // Siswa Menu
        Menu::updateOrCreate(['role_name' => 'siswa'], [
            'items' => [
                 [
                    'label' => 'Dashboard',
                    'icon' => 'HomeIcon',
                    'to' => '/admin/dashboard'
                ],
                [
                    'label' => 'Pembelajaran',
                    'icon' => 'BookOpenIcon',
                    'children' => [
                         ['label' => 'Jadwal Pelajaran', 'to' => '/admin/kbm-schedule/student'],
                         ['label' => 'Kursus Saya', 'to' => '/admin/elearning/learn'],
                    ]
                ],
                [
                     'label' => 'Ujian',
                     'icon' => 'PencilSquareIcon',
                     'to' => '/admin/tka/student/list'
                ]
            ]
        ]);
    }
}
