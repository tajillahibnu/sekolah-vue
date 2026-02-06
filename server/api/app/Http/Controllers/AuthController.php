<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Traits\ApiResponseTrait;

class AuthController extends Controller
{
    use ApiResponseTrait;

    /**
     * Handle an authentication attempt.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = User::where('email', $request->email)->first();
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Get Roles and Permissions via Spatie
            $roles = $user->getRoleNames(); // Returns a collection of role names
            $permissions = $user->getAllPermissions()->pluck('name'); // Returns a collection of permission objects

            return $this->success([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $roles->map(function($roleName) use ($permissions) {
                        return [
                            'id' => $roleName, // Frontend expects 'id'
                            'name' => ucfirst($roleName),
                            'permissions' => $permissions // Spatie flattens permissions, so we can just return all permissions here or filter if we wanted strict role-based permissions
                        ];
                    }),
                ],
            ], 'Login Berhasil');
        }

        return $this->unauthorized('Kredensial yang diberikan tidak cocok dengan catatan kami.');
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Berhasil keluar');
    }
}
