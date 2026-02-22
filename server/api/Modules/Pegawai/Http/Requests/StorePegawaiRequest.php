<?php

namespace Modules\Pegawai\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePegawaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nip' => 'nullable|string|unique:pegawais,nip',
            'nik' => 'required|string|unique:pegawais,nik',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:pegawais,email',
            'phone' => 'nullable|string',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'birth_place' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'religion' => 'nullable|string',
            'address' => 'nullable|string',
            'education' => 'nullable|string',
            'type' => 'required|in:Guru,Pegawai',
            'position' => 'nullable|string',
            'status' => 'required|in:Aktif,Nonaktif',
            'join_date' => 'nullable|date',
            'create_user' => 'nullable|boolean',
        ];
    }
}
