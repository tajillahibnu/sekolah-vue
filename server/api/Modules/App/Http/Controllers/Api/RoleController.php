<?php

namespace Modules\App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\App\Models\Role;
use Modules\App\Models\Permission;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Role::with('permissions');
        
        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('guard_name', 'like', "%{$search}%");
            });
        }
        
        $roles = $query->get();
        
        return response()->json([
            'data' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name', // Validate by name since frontend likely sends names
            'description' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);
            
            // Description handling if column exists, otherwise ignore or store differently
            // Assuming description might not exist in standard Spatie table, but requested in frontend.
            // If it doesn't exist, we just ignore it or need a migration. 
            // For now, I will comment it out or assume it's custom. 
            // The user didn't ask for migration, just endpoint for the frontend.
            // If the frontend sends description, we should try to save it if possible, 
            // but standard spatie roles don't have description.
            // I'll skip description for now to avoid SQL errors, or check if I should add it.
            // The frontend shows "description" in the UI. 
            // I should probably check the database or migration, but I can't.
            // I will assume standard fields for now to be safe, or just not fail if it's passed.
            
            if (isset($validated['permissions'])) {
                $role->syncPermissions($validated['permissions']);
            }
            
            DB::commit();

            return response()->json([
                'message' => 'Role berhasil dibuat',
                'data' => $role->load('permissions')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat role: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        
        return response()->json([
            'data' => $role
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
         $role = Role::findOrFail($id);
         
         $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
            'description' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $role->name = $validated['name'];
            $role->save();
            
            if (isset($validated['permissions'])) {
                $role->syncPermissions($validated['permissions']);
            }
            
            DB::commit();

            return response()->json([
                'message' => 'Role berhasil diperbarui',
                'data' => $role->load('permissions')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui role: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);
        
        // Prevent deleting Super Admin or critical roles if needed
        if ($role->name === 'Super Admin') {
            return response()->json(['message' => 'Tidak dapat menghapus role Super Admin'], 403);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role berhasil dihapus'
        ]);
    }
    
    /**
     * Get all available permissions
     */
    public function permissions()
    {
        $permissions = Permission::all();
        
        // Group permissions by entity/feature for easier frontend consumption if needed
        // For now, return flat list or grouped by prefix
        
        $formattedPermissions = $permissions->map(function($p) {
            return [
                'id' => $p->name, // Use name as ID for frontend compatibility
                'db_id' => $p->id,
                'name' => $p->name, 
                // Generate a readable label: "students.view" -> "Students View"
                'label' => ucwords(str_replace(['.', '-'], ' ', $p->name)),
                'guard_name' => $p->guard_name
            ];
        });

        $grouped = $formattedPermissions->groupBy(function($item) {
            $parts = explode('.', $item['name']);
            return ucfirst($parts[0] ?? 'Other');
        });

        return response()->json([
            'data' => $formattedPermissions,
            'grouped' => $grouped
        ]);
    }
}
