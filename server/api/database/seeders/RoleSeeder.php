<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\File;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Path to the dummy data file
        // server/api is base_path(), so we go up to project root and into src
        $jsonPath = base_path('../../src/data_dummy/login.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("File not found: {$jsonPath}");
            return;
        }

        $json = File::get($jsonPath);
        $data = json_decode($json, true);

        if (!isset($data['user']['roles'])) {
            $this->command->error("No roles found in dummy data");
            return;
        }

        $roles = $data['user']['roles'];

        foreach ($roles as $roleData) {
            // Create Role using ID as the name (slug) to match UserSeeder expectations
            // If id is missing, fallback to name (slugified) or just name
            $roleName = $roleData['id'] ?? strtolower($roleData['name']);
            
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            $permissions = $roleData['permissions'] ?? [];

            // Handle wildcard permission
            if (in_array('*', $permissions)) {
                 $allPermissions = Permission::all();
                 $role->syncPermissions($allPermissions);
            } else {
                // Ensure permissions exist before syncing
                $permissionIds = [];
                foreach ($permissions as $permName) {
                    $permission = Permission::firstOrCreate(['name' => $permName, 'guard_name' => 'web']);
                    $permissionIds[] = $permission->id;
                }
                
                $role->syncPermissions($permissionIds);
            }
        }

        // Ensure superadmin role exists as UserSeeder relies on it
        $superAdmin = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        // Give superadmin all permissions
        $superAdmin->syncPermissions(Permission::all());
        
        $this->command->info('Roles and permissions seeded from dummy data.');
    }
}
