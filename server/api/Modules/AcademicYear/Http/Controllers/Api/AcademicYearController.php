<?php

namespace Modules\AcademicYear\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\AcademicYear\Services\AcademicYearService;
use Modules\AcademicYear\Models\AcademicYear;
use Modules\AcademicYear\Models\AcademicTerm;
use Modules\AcademicYear\Http\Requests\AcademicYearRequest;
use Modules\AcademicYear\Http\Requests\AcademicTermRequest;
use App\Traits\ApiResponseTrait;

class AcademicYearController extends Controller
{
    use ApiResponseTrait;

    protected $academicYearService;

    public function __construct(AcademicYearService $academicYearService)
    {
        $this->academicYearService = $academicYearService;
    }

    /**
     * Dapatkan daftar Tahun sekaligus child Term didalamnya
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $isActive = $request->input('is_active');

        $academicYears = $this->academicYearService->getAll($search, $perPage, $isActive);

        return $this->successWithPagination($academicYears, 'Data tahun akademik dan sesi berhasil diambil');
    }

    /**
     * Endpoint untuk mendapatkan informasi Semester yang aktif se-aplikasi
     */
    public function getActive()
    {
        $activeSession = $this->academicYearService->getActiveSession();
        
        if (!$activeSession) {
            return $this->error('Belum ada Sesi / Tahun Akademik yang diaktifkan', 404);
        }

        // Tembak Data Join (Sesi dan Tahun-nya)
        return $this->success([
            'id' => $activeSession->id,
            'academic_year_id' => $activeSession->academic_year_id,
            'name' => $activeSession->academicYear->name, // Contoh: "2025/2026"
            'semester' => $activeSession->semester, // "Ganjil" atau "Genap"
            'start_date' => $activeSession->start_date,
            'end_date' => $activeSession->end_date,
            'is_active' => $activeSession->is_active,
            'deadlines' => [
                'uts' => $activeSession->uts_input_deadline,
                'uas' => $activeSession->uas_input_deadline,
                'raport' => $activeSession->report_release_date,
            ]
        ], 'Sesi aktif saat ini');
    }

    // CRUD TAHUN AJARAN INDUK

    public function store(AcademicYearRequest $request)
    {
        $academicYear = $this->academicYearService->createYear($request->validated());
        return $this->success($academicYear, 'Tahun akademik berhasil ditambahkan', 201);
    }

    public function show($id)
    {
        $academicYear = AcademicYear::with('terms')->find($id);
        if (!$academicYear) return $this->error('Data tidak ditemukan', 404);

        return $this->success($academicYear, 'Detail tahun akademik');
    }

    public function update(AcademicYearRequest $request, $id)
    {
        $academicYear = AcademicYear::find($id);
        if (!$academicYear) return $this->error('Data tidak ditemukan', 404);

        $updated = $this->academicYearService->updateYear($academicYear, $request->validated());
        return $this->success($updated, 'Tahun akademik berhasil diubah');
    }

    public function destroy($id)
    {
        $academicYear = AcademicYear::find($id);
        if (!$academicYear) return $this->error('Data tidak ditemukan', 404);

        $this->academicYearService->deleteYear($academicYear);
        return $this->success(null, 'Tahun akademik beserta seluruh sesinya berhasil dihapus');
    }

    // MANAJEMEN SESI TERMS ANAK

    public function storeTerm(AcademicTermRequest $request, $yearId)
    {
        $academicYear = AcademicYear::find($yearId);
        if (!$academicYear) return $this->error('Tahun Akademik Induk tidak ditemukan', 404);

        $term = $this->academicYearService->createTerm($academicYear, $request->validated());
        return $this->success($term, 'Sesi Akademik berhasil ditambahkan', 201);
    }

    public function setTermActive($id)
    {
        $academicTerm = AcademicTerm::find($id);
        if (!$academicTerm) return $this->error('Sesi Term / Semester tidak ditemukan', 404);

        $activeSession = $this->academicYearService->setTermActive($academicTerm);
        $nameDisplay = $activeSession->academicYear->name . ' - Semester ' . $activeSession->semester;
        
        return $this->success($activeSession, "Sesi {$nameDisplay} berhasil diaktifkan");
    }
}
