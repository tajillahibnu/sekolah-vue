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
    public function index()
    {
        // Return all menus. Frontend will filter based on user role.
        
        $menus = Menu::all()->map(function ($menu) {
            return [
                'role' => $menu->role_name, // Changed from role_id to role_name
                'items' => $menu->items
            ];
        });

        return $this->success($menus);
    }
}
