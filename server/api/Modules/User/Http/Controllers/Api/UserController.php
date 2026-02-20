<?php

namespace Modules\User\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Modules\User\Http\Requests\UserRequest;
use Modules\User\Services\UserService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponseTrait;

    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of the available users.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->input('search');
            $role = $request->input('role');
            $status = $request->input('status');
            $perPage = $request->input('per_page', 10);

            $paginatedUsers = $this->userService->getAllUsers($search, $role, $status, $perPage);
            
            $formattedUsers = collect($paginatedUsers->items())->map(function ($user) {
                $primaryRole = $user->primary_role ?? 'Siswa';
                $primaryRoleLower = strtolower($primaryRole);
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'primaryRole' => $primaryRole,
                    'status' => $user->status ?? 'active',
                    'joinDate' => $user->join_date ? \Carbon\Carbon::parse($user->join_date)->toIso8601String() : $user->created_at->toIso8601String(),
                    'role' => current($user->roles->pluck('name')->toArray()) ?: 'user',
                    'roles_array' => $user->roles->pluck('name')->filter(function($roleName) use ($primaryRoleLower) {
                        return strtolower($roleName) !== $primaryRoleLower;
                    })->values(),
                ];
            });

            // If we are paginating, construct pagination metadata manually or let Laravel handle
            // Since we are using ApiResponseTrait structure, let's inject paginator format
            $response = [
                'data' => $formattedUsers,
                'current_page' => $paginatedUsers->currentPage(),
                'last_page' => $paginatedUsers->lastPage(),
                'per_page' => $paginatedUsers->perPage(),
                'total' => $paginatedUsers->total(),
            ];

            return $this->success($response, 'Data user berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data user: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(UserRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->createUser($request->validated());
            return $this->success($user, 'User berhasil ditambahkan', 201);
        } catch (\Exception $e) {
            return $this->error('Gagal menambahkan user: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show($id): JsonResponse
    {
        try {
            $user = $this->userService->getUserById($id);
            return $this->success($user, 'Data user ditemukan');
        } catch (\Exception $e) {
            return $this->error('User tidak ditemukan', 404);
        }
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UserRequest $request, $id): JsonResponse
    {
        try {
            $user = $this->userService->updateUser($id, $request->validated());
            return $this->success($user, 'Data user berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->error('Gagal memperbarui user: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->userService->deleteUser($id);
            return $this->success(null, 'User berhasil dihapus');
        } catch (\Exception $e) {
            return $this->error('Gagal menghapus user: ' . $e->getMessage(), 500);
        }
    }
}
