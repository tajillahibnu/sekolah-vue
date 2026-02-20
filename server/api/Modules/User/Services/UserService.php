<?php

namespace Modules\User\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserService
{
    /**
     * Get all users with roles.
     * Optionally you can add pagination or filtering here.
     */
    public function getAllUsers($search = null, $role = null, $status = null, $perPage = 10)
    {
        $query = User::with('roles')->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role && $role !== 'all') {
            $query->where(function ($q) use ($role) {
                $q->where('primary_role', 'like', "%{$role}%")
                  ->orWhereHas('roles', function ($q2) use ($role) {
                      $q2->where('name', 'like', "%{$role}%");
                  });
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($perPage > 0) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Find a single user by ID.
     */
    public function getUserById($id)
    {
        return User::with('roles')->findOrFail($id);
    }

    /**
     * Create a new user.
     */
    public function createUser(array $data)
    {
        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'primary_role' => $data['primaryRole'] ?? 'Siswa',
                'status' => $data['status'] ?? 'active',
                'avatar' => $data['avatar'] ?? null,
                'join_date' => $data['joinDate'] ?? null,
                'password' => Hash::make($data['password']),
            ]);

            $primaryRoleStr = strtolower($data['primaryRole'] ?? 'Siswa');
            $rolesToSync = [$primaryRoleStr];

            if (isset($data['roles']) && is_array($data['roles'])) {
                foreach ($data['roles'] as $r) {
                    $rolesToSync[] = strtolower($r);
                }
            }

            $user->syncRoles(array_unique($rolesToSync));

            DB::commit();
            return $user->load('roles');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing user.
     */
    public function updateUser($id, array $data)
    {
        DB::beginTransaction();
        try {
            $user = $this->getUserById($id);

            $updateData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'primary_role' => $data['primaryRole'] ?? 'Siswa',
                'status' => $data['status'] ?? 'active',
                'join_date' => $data['joinDate'] ?? null,
            ];

            if (array_key_exists('avatar', $data)) {
                $updateData['avatar'] = $data['avatar'];
            }

            // Only update password if strictly provided
            if (!empty($data['password'])) {
                $updateData['password'] = Hash::make($data['password']);
            }

            $user->update($updateData);

            // Update roles if provided
            $primaryRoleStr = strtolower($data['primaryRole'] ?? 'Siswa');
            $rolesToSync = [$primaryRoleStr];
            
            if (isset($data['roles']) && is_array($data['roles'])) {
                foreach ($data['roles'] as $r) {
                    $rolesToSync[] = strtolower($r);
                }
            }

            $user->syncRoles(array_unique($rolesToSync));

            DB::commit();
            return $user->load('roles');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a user.
     */
    public function deleteUser($id)
    {
        $user = $this->getUserById($id);
        
        // Safety check to prevent deleting self could be added here
        
        return $user->delete();
    }
}
