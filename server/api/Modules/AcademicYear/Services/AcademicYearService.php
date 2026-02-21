<?php

namespace Modules\AcademicYear\Services;

use Modules\AcademicYear\Models\AcademicYear;
use Modules\AcademicYear\Models\AcademicTerm;
use Illuminate\Support\Facades\DB;

class AcademicYearService
{
    /**
     * Ambil data Tahun (dengan terms di dalamnya)
     */
    public function getAll($search = null, $perPage = 10, $isActive = null)
    {
        $query = AcademicYear::with('terms');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Kalau ada filter is_active true, maka query cuma tahun yg punya term aktif
        if ($isActive !== null) {
            $isActiveBool = filter_var($isActive, FILTER_VALIDATE_BOOLEAN);
            $query->whereHas('terms', function($q) use ($isActiveBool) {
                $q->where('is_active', $isActiveBool);
            });
        }

        return $query->orderBy('name', 'desc')->paginate($perPage);
    }

    /**
     * Dapatkan detail 1 term yang sekarang sedang aktif.
     */
    public function getActiveSession()
    {
        return AcademicTerm::with('academicYear')->active()->first();
    }

    public function createYear(array $data)
    {
        return DB::transaction(function () use ($data) {
            return AcademicYear::create(['name' => $data['name']]);
        });
    }

    public function updateYear(AcademicYear $year, array $data)
    {
        return DB::transaction(function () use ($year, $data) {
            $year->update(['name' => $data['name']]);
            return $year;
        });
    }

    public function deleteYear(AcademicYear $year)
    {
        return $year->delete();
    }

    // --- MANANAJEMEN TERM / SEMESTER ---

    public function createTerm(AcademicYear $year, array $data)
    {
        return DB::transaction(function () use ($year, $data) {
            if (isset($data['is_active']) && $data['is_active']) {
                $this->deactivateAllTerms();
            }
            return $year->terms()->create($data);
        });
    }

    public function updateTerm(AcademicTerm $term, array $data)
    {
        return DB::transaction(function () use ($term, $data) {
            if (isset($data['is_active']) && $data['is_active']) {
                $this->deactivateAllTerms($term->id);
            }
            $term->update($data);
            return $term;
        });
    }

    public function deleteTerm(AcademicTerm $term)
    {
        return $term->delete();
    }

    public function setTermActive(AcademicTerm $term)
    {
        return DB::transaction(function () use ($term) {
            $this->deactivateAllTerms($term->id);
            $term->update(['is_active' => true]);
            
            // Return dengan load relation buat API
            return $term->load('academicYear');
        });
    }

    /**
     * Matikan seluruh terms (secara global).
     */
    private function deactivateAllTerms($exceptTermId = null)
    {
        $query = AcademicTerm::where('is_active', true);
        if ($exceptTermId) {
            $query->where('id', '!=', $exceptTermId);
        }
        $query->update(['is_active' => false]);
    }
}
