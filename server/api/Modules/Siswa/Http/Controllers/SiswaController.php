<?php

namespace Modules\Siswa\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Siswa\Models\Siswa;
use Modules\Siswa\Transformers\SiswaResource;
use Illuminate\Support\Facades\DB;

class SiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Siswa::query()
            ->with(['parents', 'classrooms', 'level']);

        // Filter by class (if provided, via classroom_siswa pivot connection)
        if ($request->has('class') && $request->class !== '') {
            $class = $request->class;
            $query->whereHas('classrooms', function ($q) use ($class) {
                $q->where('rombels.id', $class)
                  ->orWhere('rombels.name', 'like', "%{$class}%");
            });
        }

        // Filter unclassed students (PPDB/Transfer)
        if ($request->has('unclassed') && $request->unclassed == 'true') {
            $query->whereDoesntHave('classrooms');
        }

        // Filter classed students
        if ($request->has('classed') && $request->classed == 'true') {
            $query->whereHas('classrooms');
        }

        if ($request->filled('tingkat_id')) {
            $query->where('tingkat_id', $request->tingkat_id);
        }

        // Search query
        if ($request->has('q') && $request->q !== '') {
            $searchTerm = $request->q;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('nis', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }

        $limit = $request->input('limit', 10);
        $siswas = $query->latest()->paginate($limit);

        return SiswaResource::collection($siswas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nis' => 'nullable|unique:siswas,nis',
            'nisn' => 'nullable|unique:siswas,nisn',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:siswas,email',
            'gender' => 'nullable|in:L,P',
            'birth_place' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'religion' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,graduated,transferred',
            'join_date' => 'nullable|date',
            'academic.previousSchool' => 'nullable|string',
            'academic.entryScore' => 'nullable|numeric',
            'academic.achievements' => 'nullable|array',
            'parent.father.name' => 'nullable|string',
            'parent.father.phone' => 'nullable|string',
            'parent.father.occupation' => 'nullable|string',
            'parent.mother.name' => 'nullable|string',
            'parent.mother.phone' => 'nullable|string',
            'parent.mother.occupation' => 'nullable|string',
            'parent.wali.name' => 'nullable|string',
            'parent.wali.phone' => 'nullable|string',
            'parent.wali.occupation' => 'nullable|string',
            'avatar' => 'nullable|url',
        ]);

        try {
            DB::beginTransaction();

            // Create siswa
            $siswa = Siswa::create([
                'nis' => $validated['nis'] ?? null,
                'nisn' => $validated['nisn'] ?? null,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'gender' => $validated['gender'] ?? null,
                'birth_place' => $validated['birth_place'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'religion' => $validated['religion'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'status' => $validated['status'] ?? 'active',
                'join_date' => $validated['join_date'] ?? now(),
                'previous_school' => $validated['academic']['previousSchool'] ?? null,
                'entry_score' => $validated['academic']['entryScore'] ?? null,
                'achievements' => $validated['academic']['achievements'] ?? null,
                'avatar' => $validated['avatar'] ?? null,
            ]);

            // Create parents
            $siswa->parents()->create([
                'father_name' => $validated['parent']['father']['name'] ?? null,
                'father_phone' => $validated['parent']['father']['phone'] ?? null,
                'father_occupation' => $validated['parent']['father']['occupation'] ?? null,
                'mother_name' => $validated['parent']['mother']['name'] ?? null,
                'mother_phone' => $validated['parent']['mother']['phone'] ?? null,
                'mother_occupation' => $validated['parent']['mother']['occupation'] ?? null,
                'wali_name' => $validated['parent']['wali']['name'] ?? null,
                'wali_phone' => $validated['parent']['wali']['phone'] ?? null,
                'wali_occupation' => $validated['parent']['wali']['occupation'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Siswa berhasil ditambahkan',
                'data' => new SiswaResource($siswa->load('parents'))
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan data: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $siswa = Siswa::with(['parents', 'classrooms'])->findOrFail($id);
        return new SiswaResource($siswa);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $siswa = Siswa::findOrFail($id);

        $validated = $request->validate([
            'nis' => 'nullable|unique:siswas,nis,' . $siswa->id,
            'nisn' => 'nullable|unique:siswas,nisn,' . $siswa->id,
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:siswas,email,' . $siswa->id,
            'gender' => 'nullable|in:L,P',
            'birth_place' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'religion' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,graduated,transferred',
            'join_date' => 'nullable|date',
            'academic.previousSchool' => 'nullable|string',
            'academic.entryScore' => 'nullable|numeric',
            'academic.achievements' => 'nullable|array',
            'parent.father.name' => 'nullable|string',
            'parent.father.phone' => 'nullable|string',
            'parent.father.occupation' => 'nullable|string',
            'parent.mother.name' => 'nullable|string',
            'parent.mother.phone' => 'nullable|string',
            'parent.mother.occupation' => 'nullable|string',
            'parent.wali.name' => 'nullable|string',
            'parent.wali.phone' => 'nullable|string',
            'parent.wali.occupation' => 'nullable|string',
            'avatar' => 'nullable|url',
        ]);

        try {
            DB::beginTransaction();

            $siswa->update([
                'nis' => $validated['nis'] ?? $siswa->nis,
                'nisn' => $validated['nisn'] ?? $siswa->nisn,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'gender' => $validated['gender'] ?? $siswa->gender,
                'birth_place' => $validated['birth_place'] ?? $siswa->birth_place,
                'birth_date' => $validated['birth_date'] ?? $siswa->birth_date,
                'religion' => $validated['religion'] ?? $siswa->religion,
                'phone' => $validated['phone'] ?? $siswa->phone,
                'address' => $validated['address'] ?? $siswa->address,
                'status' => $validated['status'] ?? $siswa->status,
                'join_date' => $validated['join_date'] ?? $siswa->join_date,
                'previous_school' => $validated['academic']['previousSchool'] ?? $siswa->previous_school,
                'entry_score' => $validated['academic']['entryScore'] ?? $siswa->entry_score,
                'achievements' => $validated['academic']['achievements'] ?? $siswa->achievements,
                'avatar' => $validated['avatar'] ?? $siswa->avatar,
            ]);

            if ($siswa->parents) {
                $siswa->parents()->update([
                    'father_name' => $validated['parent']['father']['name'] ?? $siswa->parents->father_name,
                    'father_phone' => $validated['parent']['father']['phone'] ?? $siswa->parents->father_phone,
                    'father_occupation' => $validated['parent']['father']['occupation'] ?? $siswa->parents->father_occupation,
                    'mother_name' => $validated['parent']['mother']['name'] ?? $siswa->parents->mother_name,
                    'mother_phone' => $validated['parent']['mother']['phone'] ?? $siswa->parents->mother_phone,
                    'mother_occupation' => $validated['parent']['mother']['occupation'] ?? $siswa->parents->mother_occupation,
                    'wali_name' => $validated['parent']['wali']['name'] ?? $siswa->parents->wali_name,
                    'wali_phone' => $validated['parent']['wali']['phone'] ?? $siswa->parents->wali_phone,
                    'wali_occupation' => $validated['parent']['wali']['occupation'] ?? $siswa->parents->wali_occupation,
                ]);
            } else {
                $siswa->parents()->create([
                    'father_name' => $validated['parent']['father']['name'] ?? null,
                    'father_phone' => $validated['parent']['father']['phone'] ?? null,
                    'father_occupation' => $validated['parent']['father']['occupation'] ?? null,
                    'mother_name' => $validated['parent']['mother']['name'] ?? null,
                    'mother_phone' => $validated['parent']['mother']['phone'] ?? null,
                    'mother_occupation' => $validated['parent']['mother']['occupation'] ?? null,
                    'wali_name' => $validated['parent']['wali']['name'] ?? null,
                    'wali_phone' => $validated['parent']['wali']['phone'] ?? null,
                    'wali_occupation' => $validated['parent']['wali']['occupation'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Data Siswa berhasil diperbarui',
                'data' => new SiswaResource($siswa->load('parents'))
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui data: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $siswa = Siswa::findOrFail($id);
        $siswa->delete();
        
        return response()->json(['message' => 'Data Siswa berhasil dihapus']);
    }
}
