<?php

namespace Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $userId = $this->route('user'); // Get ID if updating

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $userId,
            'phone' => 'required|string|max:20',
            'primaryRole' => 'required|string|in:Siswa,Guru,Karyawan',
            'status' => 'nullable|string|in:active,inactive',
            'avatar' => 'nullable|string',
            'joinDate' => 'required|date',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,name',
        ];

        // Password is required only on creation
        if ($this->isMethod('POST')) {
            $rules['password'] = 'required|string|min:6';
        } else {
            $rules['password'] = 'nullable|string|min:6';
        }

        return $rules;
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama pengguna wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'joinDate.required' => 'Tanggal bergabung wajib diisi.',
            'primaryRole.required' => 'Role utama pengguna wajib dipilih.',
            'primaryRole.in' => 'Role utama harus Siswa, Guru, atau Karyawan.',
            'roles.*.exists' => 'Role tambahan tidak ditemukan di sistem.',
            'password.required' => 'Password wajib diisi untuk pengguna baru.',
            'password.min' => 'Password minimal harus 6 karakter.',
        ];
    }
}
