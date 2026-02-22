<?php

namespace Modules\Siswa\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiswaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'nis' => $this->nis,
            'nisn' => $this->nisn,
            'name' => $this->name,
            'email' => $this->email,
            'gender' => $this->gender,
            'birthPlace' => $this->birth_place,
            'birthDate' => $this->birth_date ? $this->birth_date->format('Y-m-d') : null,
            'religion' => $this->religion,
            'phone' => $this->phone,
            'address' => $this->address,
            'status' => $this->status,
            'joinDate' => $this->join_date ? $this->join_date->format('Y-m-d') : null,
            'class' => $this->classrooms ? ($this->classrooms->first() ? $this->classrooms->first()->name : 'Belum Ditentukan') : 'Belum Ditentukan',
            'academicYear' => '2024/2025', // Should be dynamic in the future based on active academic year
            'avatar' => $this->avatar,
            'parent' => [
                'father' => [
                    'name' => $this->parents ? $this->parents->father_name : '',
                    'phone' => $this->parents ? $this->parents->father_phone : '',
                    'occupation' => $this->parents ? $this->parents->father_occupation : '',
                ],
                'mother' => [
                    'name' => $this->parents ? $this->parents->mother_name : '',
                    'phone' => $this->parents ? $this->parents->mother_phone : '',
                    'occupation' => $this->parents ? $this->parents->mother_occupation : '',
                ],
                'wali' => [
                    'name' => $this->parents ? $this->parents->wali_name : '',
                    'phone' => $this->parents ? $this->parents->wali_phone : '',
                    'occupation' => $this->parents ? $this->parents->wali_occupation : '',
                ]
            ],
            'academic' => [
                'previousSchool' => $this->previous_school,
                'entryScore' => $this->entry_score,
                'achievements' => $this->achievements ?? [],
            ],
            'level' => [
                'id' => $this->tingkat_id,
                'name' => $this->level ? $this->level->name : 'Unknown',
            ],
            'createdAt' => $this->created_at,
        ];
    }
}
