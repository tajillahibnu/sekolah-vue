<?php

namespace Modules\Pegawai\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Modules\Pegawai\Models\Pegawai;
use App\Models\User;
use Illuminate\Http\Request;
use Modules\Pegawai\Http\Requests\StorePegawaiRequest;
use Modules\Pegawai\Http\Requests\UpdatePegawaiRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Traits\ApiResponseTrait;

class PegawaiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            $query = Pegawai::with('user');

            if ($request->has('q') && !empty($request->q)) {
                $q = $request->q;
                $query->where(function($subQuery) use ($q) {
                    $subQuery->where('name', 'LIKE', "%{$q}%")
                             ->orWhere('nip', 'LIKE', "%{$q}%")
                             ->orWhere('nik', 'LIKE', "%{$q}%");
                });
            }

            if ($request->has('type') && !empty($request->type)) {
                if ($request->type !== 'Semua') {
                    $query->where('type', $request->type);
                }
            }

            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            $perPage = $request->input('limit', 10);
            
            if ($perPage === 'all') {
                $pegawais = $query->orderBy('name', 'asc')->get();
                return $this->success($pegawais, 'Data pegawai berhasil diambil');
            }

            $pegawais = $query->orderBy('name', 'asc')->paginate($perPage);

            return $this->successWithPagination($pegawais, 'Data pegawai berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data pegawai: ' . $e->getMessage(), 500);
        }
    }

    public function store(StorePegawaiRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $userId = null;

            // Jika admin mencentang / minta buat akun User
            if ($request->boolean('create_user')) {
                // Default pass pake NIK
                $password = $data['nik'];
                
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($password),
                ]);

                // Beri role default sesuai type (misal 'guru' atau 'pegawai')
                // Pastikan role tersebut ada di database (spatie permission)
                $roleName = strtolower($data['type']);
                if (\Spatie\Permission\Models\Role::where('name', $roleName)->exists()) {
                    $user->assignRole($roleName);
                }

                $userId = $user->id;
            }

            $data['user_id'] = $userId;
            $pegawai = Pegawai::create($data);

            DB::commit();
            return $this->success($pegawai->load('user'), 'Pegawai berhasil ditambahkan', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Gagal menambahkan pegawai: ' . $e->getMessage(), 500);
        }
    }

    public function show(Pegawai $pegawai)
    {
        return $this->success($pegawai->load('user'), 'Data pegawai berhasil ditemukan');
    }

    public function update(UpdatePegawaiRequest $request, Pegawai $pegawai)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->boolean('create_user') && !$pegawai->user_id) {
                // Buat user jika sebelumnya belum ada
                $password = $data['nik'];
                
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($password),
                ]);

                $roleName = strtolower($data['type']);
                if (\Spatie\Permission\Models\Role::where('name', $roleName)->exists()) {
                    $user->assignRole($roleName);
                }

                $data['user_id'] = $user->id;
            } else if ($pegawai->user_id) {
                // Update tabel User terkait (nama dan email disamakan dengan pegawai)
                $user = User::find($pegawai->user_id);
                if ($user) {
                    $user->update([
                        'name' => $data['name'],
                        'email' => $data['email']
                    ]);
                    
                    // Sync ulang rolenya jika tipe berubah
                    $roleName = strtolower($data['type']);
                    if (\Spatie\Permission\Models\Role::where('name', $roleName)->exists()) {
                        $user->syncRoles([$roleName]);
                    }
                }
            }

            $pegawai->update($data);

            DB::commit();
            return $this->success($pegawai->fresh('user'), 'Pegawai berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Gagal memperbarui pegawai: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Pegawai $pegawai)
    {
        DB::beginTransaction();
        try {
            // Jika mau user ikut dihapus:
            // if ($pegawai->user_id) { User::find($pegawai->user_id)?->delete(); }
            
            $pegawai->delete();
            DB::commit();
            return $this->success(null, 'Pegawai berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Gagal menghapus pegawai: ' . $e->getMessage(), 500);
        }
    }

    public function uploadPhoto(Request $request, $id)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120' // Max 5MB
        ]);

        $pegawai = Pegawai::find($id);
        if (!$pegawai) {
            return $this->error('Data pegawai tidak ditemukan', 404);
        }

        if (!$pegawai->user_id) {
            return $this->error('Pegawai belum terintegrasi dengan akun User. Silakan edit dan centang Buat Akun terlebih dahulu.', 400);
        }

        $user = User::find($pegawai->user_id);
        if (!$user) {
            return $this->error('Data User terikat tidak ditemukan', 404);
        }

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $imageData = base64_encode($file->getContent());
            $mimeType = $file->getMimeType();
            
            $base64String = 'data:' . $mimeType . ';base64,' . $imageData;
            
            $user->avatar = $base64String;
            $user->save();

            return $this->success(['photo_url' => $base64String], 'Foto profil berhasil disimpan ke database');
        }

        return $this->error('Gagal mengunggah foto', 400);
    }
}
