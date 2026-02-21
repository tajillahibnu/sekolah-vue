<?php

namespace App\Http\Controllers;

use App\Models\MataPelajaran;
use Illuminate\Http\Request;
use App\Traits\ApiResponseTrait;

class MataPelajaranController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = MataPelajaran::query();

            // Search functionality
            if ($request->has('q') && !empty($request->q)) {
                $q = $request->q;
                $query->where(function($subQuery) use ($q) {
                    $subQuery->where('nama', 'LIKE', "%{$q}%")
                             ->orWhere('kode', 'LIKE', "%{$q}%")
                             ->orWhere('kategori', 'LIKE', "%{$q}%");
                });
            }

            // Pagination settings
            $perPage = $request->input('limit', 10);
            $mataPelajaran = $query->orderBy('nama', 'asc')->paginate($perPage);

            return $this->successWithPagination($mataPelajaran, 'Data mata pelajaran berhasil diambil');

        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data mata pelajaran: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|unique:mata_pelajaran,kode|max:20',
            'deskripsi' => 'nullable|string',
            'kategori' => 'nullable|string',
            'tipe' => 'required|in:Teori,Praktik,Campuran',
            'is_aktif' => 'boolean',
        ]);

        try {
            $mp = MataPelajaran::create($validated);
            return $this->success($mp, 'Mata pelajaran berhasil ditambahkan', 201);
        } catch (\Exception $e) {
            return $this->error('Gagal menambahkan mata pelajaran: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(MataPelajaran $mataPelajaran)
    {
        return $this->success($mataPelajaran, 'Data mata pelajaran berhasil ditemukan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MataPelajaran $mataPelajaran)
    {
        $validated = $request->validate([
            'nama' => 'string|max:255',
            'kode' => 'string|max:20|unique:mata_pelajaran,kode,' . $mataPelajaran->id,
            'deskripsi' => 'nullable|string',
            'kategori' => 'nullable|string',
            'tipe' => 'in:Teori,Praktik,Campuran',
            'is_aktif' => 'boolean',
        ]);

        try {
            $mataPelajaran->update($validated);
            return $this->success($mataPelajaran, 'Mata pelajaran berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->error('Gagal memperbarui mata pelajaran: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MataPelajaran $mataPelajaran)
    {
        //
    }
}
