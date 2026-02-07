<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
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
            $role = Role::firstOrCreate(['name' => $roleName]);

            if ($roleName === 'superadmin' || $roleName === 'admin') {
                $role->syncPermissions(Permission::all());
            } elseif ($roleName === 'guru') {
                $role->syncPermissions([
                    'elearning.teach', 'attendance.view', 'bulletin.submit', 'bulletin.view'
                ]);
            } elseif ($roleName === 'siswa') {
                $role->syncPermissions([
                    'elearning.learn', 'bulletin.view'
                ]);
            } elseif ($roleName === 'kesiswaan') {
                $role->syncPermissions([
                    'students.view', 'students.edit', 'employees.view', 'violations.view'
                ]);
            } elseif ($roleName === 'kurikulum') {
                $role->syncPermissions([
                    'students.view', 'students.create', 'students.edit', 'students.delete',
                    'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
                    'academic.manage', 'classes.manage', 'matapelajaran.manage'
                ]);
            } elseif ($roleName === 'walikelas') {
                $role->syncPermissions([
                    'students.view', 'attendance.view', 'bulletin.view'
                ]);
            }
        }
    }
}
