<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Menu;
use App\Traits\ApiResponseTrait;

class MenuController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $userRoles = $user->roles;
            $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();

            $responseData = [];

            foreach ($userRoles as $role) {
                // Fetch permissions specific to this role only
                $rolePermissions = $role->permissions->pluck('name')->toArray();
                
                $menus = $this->getHierarchicalMenus(null, $rolePermissions);

                $responseData[] = [
                    'role' => $role->name,
                    'items' => $menus
                ];
            }

            return $this->success($responseData, 'Menus retrieved successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to retrieve menus: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Recursive function to build hierarchical menu and filter by permissions.
     */
    private function getHierarchicalMenus($parentId = null, array $userPermissions)
    {
        return Menu::where('parent_id', $parentId)
            ->orderBy('order')
            ->get()
            ->filter(function ($menu) use ($userPermissions) {
                // If menu has no permission requirement, it's visible to everyone
                if (!$menu->permission_name) {
                    return true;
                }
                // Check if user has the required permission
                return in_array($menu->permission_name, $userPermissions);
            })
            ->map(function ($menu) use ($userPermissions) {
                $item = [
                    'label' => $menu->name,
                    'icon' => $menu->icon_menu,
                ];

                if ($menu->to) {
                    $item['to'] = $menu->to;
                }

                $children = $this->getHierarchicalMenus($menu->id, $userPermissions);
                if ($children->isNotEmpty()) {
                    $item['children'] = $children->values()->toArray();
                }

                return $item;
            })
            ->values();
    }
}
