<?php

namespace Modules\Pegawai\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePegawaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('pegawai') ? $this->route('pegawai')->id : null;

        return [
            'nip' => 'nullable|string|unique:pegawais,nip,' . $id,
            'nik' => 'required|string|unique:pegawais,nik,' . $id,
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:pegawais,email,' . $id,
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
