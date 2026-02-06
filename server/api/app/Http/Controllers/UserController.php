<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Traits\ApiResponseTrait;

class UserController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get authenticated user profile.
     */
    public function profile(Request $request)
    {
        try {
            $user = $request->user();
            
            // Format user data with roles and permissions like in AuthController
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(function ($role) {
                    return [
                        'id' => $role->name,
                        'name' => ucfirst($role->name),
                        'permissions' => $role->permissions->pluck('name')
                    ];
                })
            ];

            return $this->success($userData, 'User profile retrieved successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to retrieve user profile: ' . $e->getMessage(), 500);
        }
    }
}
