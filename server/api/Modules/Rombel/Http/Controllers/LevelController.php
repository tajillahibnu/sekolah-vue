<?php

namespace Modules\Rombel\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Rombel\Models\Level;

class LevelController extends Controller
{
    public function index(Request $request)
    {
        $query = Level::query();

        if ($request->filled('q')) {
            $query->where('name', 'like', "%{$request->q}%");
        }

        $limit = $request->input('limit', 10);
        $levels = $query->paginate($limit);

        $items = collect($levels->items())->map(function ($level) {
            return [
                'id' => $level->id,
                'name' => $level->name,
                'description' => $level->description,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $levels->currentPage(),
                'last_page' => $levels->lastPage(),
                'total' => $levels->total(),
                'has_more' => $levels->hasMorePages(),
            ]
        ]);
    }
}
