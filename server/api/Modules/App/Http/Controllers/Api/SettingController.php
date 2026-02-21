<?php

namespace Modules\App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Modules\App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        $query = Setting::query();

        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $limit = $request->get('limit', 10);
        
        if ($limit === 'all') {
            $settings = $query->orderBy('created_at', 'desc')->get();
            $meta = ['total' => $settings->count()];
            return response()->json([
                'status' => 'success',
                'data' => $settings,
                'meta' => $meta
            ]);
        }

        $settings = $query->orderBy('created_at', 'desc')->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => $settings->items(),
            'meta' => [
                'current_page' => $settings->currentPage(),
                'last_page' => $settings->lastPage(),
                'per_page' => $settings->perPage(),
                'total' => $settings->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|string|unique:settings,key',
            'name' => 'required|string',
            'value' => 'nullable',
            'type' => 'nullable|string|in:string,json,boolean,integer',
            'group' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $type = $request->type ?? 'string';
        $value = $request->value;

        if ($type === 'json' && is_array($value)) {
            $value = json_encode($value);
        } elseif ($type === 'boolean') {
            $value = $value ? '1' : '0';
        }

        $setting = Setting::create([
            'key' => $request->key,
            'name' => $request->name,
            'value' => $value,
            'type' => $type,
            'group' => $request->group,
            'description' => $request->description,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Setting berhasil ditambahkan',
            'data' => $setting
        ], 201);
    }

    public function show($id)
    {
        // Support finding by key as well
        $setting = Setting::where('id', $id)->orWhere('key', $id)->first();

        if (!$setting) {
            return response()->json([
                'status' => 'error',
                'message' => 'Setting tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $setting
        ]);
    }

    public function update(Request $request, $id)
    {
        $setting = Setting::where('id', $id)->orWhere('key', $id)->first();

        if (!$setting) {
            return response()->json([
                'status' => 'error',
                'message' => 'Setting tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'key' => 'sometimes|string|unique:settings,key,' . $setting->id,
            'name' => 'sometimes|string',
            'value' => 'nullable',
            'type' => 'nullable|string|in:string,json,boolean,integer',
            'group' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $type = $request->has('type') ? $request->type : $setting->type;
        $value = $request->has('value') ? $request->value : $setting->value;

        if ($request->has('value')) {
            if ($type === 'json' && is_array($value)) {
                $value = json_encode($value);
            } elseif ($type === 'boolean') {
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
            }
        }

        $setting->update([
            'key' => $request->key ?? $setting->key,
            'name' => $request->name ?? $setting->name,
            'value' => $request->has('value') ? $value : $setting->value,
            'type' => $type,
            'group' => $request->group ?? $setting->group,
            'description' => $request->description ?? $setting->description,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Setting berhasil diperbarui',
            'data' => $setting
        ]);
    }

    public function destroy($id)
    {
        $setting = Setting::find($id);

        if (!$setting) {
            return response()->json([
                'status' => 'error',
                'message' => 'Setting tidak ditemukan'
            ], 404);
        }

        $setting->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Setting berhasil dihapus'
        ]);
    }
}
