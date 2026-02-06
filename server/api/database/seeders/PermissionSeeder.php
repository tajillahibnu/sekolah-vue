<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Internal App Management
            'roles.manage',
            'settings.manage',
            'logs.view',
            'menu.manage',

            // Students (Granular)
            'students.view',
            'students.create',
            'students.edit',
            'students.delete',
            'students.upload',
            'students.download',

            // Employees / Teachers
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',

            // Academic
            'academic.manage',
            'classes.view',
            'classes.manage',
            'subjects.view',
            'subjects.manage',

            // Features
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
            'violations.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }
    }
}
