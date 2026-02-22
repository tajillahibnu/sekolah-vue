<?php

namespace Modules\Rombel\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Rombel\Models\Rombel;
use Modules\AcademicYear\Services\AcademicYearService;
use Modules\Siswa\Models\Siswa;
use Illuminate\Support\Facades\DB;

class RombelController extends Controller
{
    protected $academicYearService;

    public function __construct(AcademicYearService $academicYearService)
    {
        $this->academicYearService = $academicYearService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Rombel::with('level');

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhereHas('level', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $limit = $request->input('limit', 10);
        $classrooms = $query->paginate($limit);

        $items = collect($classrooms->items())->map(function ($classroom) {
            return [
                'id' => $classroom->id,
                'name' => 'Kelas ' . ($classroom->level ? $classroom->level->name : '') . ' - ' . $classroom->name,
                'level_id' => $classroom->level_id,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $classrooms->currentPage(),
                'last_page' => $classrooms->lastPage(),
                'total' => $classrooms->total(),
                'has_more' => $classrooms->hasMorePages(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Assign students to a Rombel.
     */
    public function assignStudents(Request $request, string $id)
    {
        $rombel = Rombel::findOrFail($id);
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:siswas,id',
        ]);

        $activeSession = $this->academicYearService->getActiveSession();
        if (!$activeSession) {
            return response()->json(['message' => 'Tahun akademik aktif tidak ditemukan.'], 422);
        }

        try {
            DB::beginTransaction();

            $studentIds = $request->student_ids;
            $academicYearId = $activeSession->academic_year_id;

            // Update students tingkat_id and attach to rombel
            foreach ($studentIds as $studentId) {
                $siswa = Siswa::find($studentId);
                if ($siswa) {
                    $siswa->update(['tingkat_id' => $rombel->tingkat_id]);
                    
                    // Attach to rombel if not already attached
                    $rombel->students()->syncWithoutDetaching([
                        $studentId => ['academic_year_id' => $academicYearId]
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => count($studentIds) . ' siswa berhasil ditempatkan ke ' . $rombel->name,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menempatkan siswa: ' . $e->getMessage()], 500);
        }
    }
}
