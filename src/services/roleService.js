import api from './api';

// Mock data for development
const mockRoles = [
    {
        id: 1,
        name: 'Super Admin',
        description: 'Akses penuh ke semua fitur sistem',
        permissions: ['*']
    },
    {
        id: 2,
        name: 'Guru',
        description: 'Akses untuk kegiatan akademik dan kesiswaan',
        permissions: [
            'dashboard.view',
            'students.view',
            'students.grade',
            'classes.view',
            'schedules.view',
            'assignments.manage'
        ]
    },
    {
        id: 3,
        name: 'Tata Usaha',
        description: 'Manajemen administrasi dan keuangan',
        permissions: [
            'dashboard.view',
            'users.view',
            'students.manage',
            'employees.manage',
            'finance.manage'
        ]
    }
];

// Standardized Permissions matching menus.json structure
// Base CRUD: view, create, edit, delete
// Additional: specific actions
const mockPermissions = {
    // --- MAIN ---
    'Dashboard': [
        { id: 'dashboard.view', label: 'Lihat Dashboard' },
        { id: 'dashboard.widgets', label: 'Atur Widget' }
    ],

    // --- DATA UTAMA ---
    'Data Siswa': [
        { id: 'students.view', label: 'Lihat Data Siswa' },
        { id: 'students.create', label: 'Tambah Siswa' },
        { id: 'students.edit', label: 'Edit Data Siswa' },
        { id: 'students.delete', label: 'Hapus Data Siswa' },
        { id: 'students.import', label: 'Import Excel' },
        { id: 'students.export', label: 'Export Excel' }
    ],
    'Data Pegawai': [
        { id: 'employees.view', label: 'Lihat Data Pegawai' },
        { id: 'employees.create', label: 'Tambah Pegawai' },
        { id: 'employees.edit', label: 'Edit Data Pegawai' },
        { id: 'employees.delete', label: 'Hapus Data Pegawai' },
        { id: 'employees.attendance', label: 'Kelola Absensi Pegawai' }
    ],

    // --- AKADEMIK ---
    'Akademik': [
        { id: 'academic.view', label: 'Akses Menu Akademik' } // Parent permission
    ],
    'Tahun Ajaran': [
        { id: 'academic-year.view', label: 'Lihat Tahun Ajaran' },
        { id: 'academic-year.create', label: 'Buat Tahun Ajaran' },
        { id: 'academic-year.edit', label: 'Edit Tahun Ajaran' },
        { id: 'academic-year.delete', label: 'Hapus Tahun Ajaran' },
        { id: 'academic-year.activate', label: 'Aktifkan Tahun Ajaran' }
    ],
    'Mata Pelajaran': [
        { id: 'subjects.view', label: 'Lihat Mata Pelajaran' },
        { id: 'subjects.create', label: 'Tambah Mapel' },
        { id: 'subjects.edit', label: 'Edit Mapel' },
        { id: 'subjects.delete', label: 'Hapus Mapel' },
        { id: 'subjects.curriculum', label: 'Atur Kurikulum Mapel' }
    ],
    'Kelas': [
        { id: 'classes.view', label: 'Lihat Daftar Kelas' },
        { id: 'classes.create', label: 'Buat Kelas Baru' },
        { id: 'classes.edit', label: 'Edit Info Kelas' },
        { id: 'classes.delete', label: 'Hapus Kelas' },
        { id: 'classes.homeroom', label: 'Atur Wali Kelas' },
        { id: 'classes.promote', label: 'Kenaikan Kelas' }
    ],
    'Jadwal': [
        { id: 'schedule.view', label: 'Lihat Jadwal' },
        { id: 'schedule.create', label: 'Buat Jadwal' },
        { id: 'schedule.edit', label: 'Edit Jadwal' },
        { id: 'schedule.delete', label: 'Hapus Jadwal' },
        { id: 'schedule.print', label: 'Cetak Jadwal' }
    ],

    // --- KEUANGAN ---
    'Keuangan': [
        { id: 'finance.view', label: 'Akses Menu Keuangan' }
    ],
    'Pembayaran SPP': [
        { id: 'tuition.view', label: 'Lihat Data SPP' },
        { id: 'tuition.create', label: 'Input Transaksi' },
        { id: 'tuition.edit', label: 'Edit Transaksi' },
        { id: 'tuition.delete', label: 'Batalkan Transaksi' },
        { id: 'tuition.invoice', label: 'Cetak Invoice' },
        { id: 'tuition.remind', label: 'Kirim Pengingat WA' }
    ],
    'Tabungan Siswa': [
        { id: 'savings.view', label: 'Lihat Tabungan' },
        { id: 'savings.deposit', label: 'Setor Tunai' },
        { id: 'savings.withdraw', label: 'Tarik Tunai' },
        { id: 'savings.history', label: 'Riwayat Mutasi' }
    ],
    'Laporan Keuangan': [
        { id: 'finance-report.view', label: 'Lihat Laporan' },
        { id: 'finance-report.daily', label: 'Laporan Harian' },
        { id: 'finance-report.monthly', label: 'Laporan Bulanan' },
        { id: 'finance-report.export', label: 'Export Laporan' }
    ],

    // --- FASILITAS ---
    'Fasilitas': [
        { id: 'facilities.view', label: 'Lihat Fasilitas' },
        { id: 'facilities.create', label: 'Tambah Fasilitas' },
        { id: 'facilities.edit', label: 'Edit Fasilitas' },
        { id: 'facilities.delete', label: 'Hapus Fasilitas' },
        { id: 'facilities.maintenance', label: 'Jadwal Maintenance' }
    ],

    // --- PERPUSTAKAAN ---
    'Perpustakaan': [
        { id: 'library.view', label: 'Akses Perpustakaan' }
    ],
    'Daftar Buku': [
        { id: 'books.view', label: 'Lihat Katalog Buku' },
        { id: 'books.create', label: 'Tambah Buku Baru' },
        { id: 'books.edit', label: 'Edit Data Buku' },
        { id: 'books.delete', label: 'Hapus Buku' },
        { id: 'books.stock', label: 'Opname Stok' }
    ],
    'Peminjaman': [
        { id: 'loans.view', label: 'Lihat Peminjaman' },
        { id: 'loans.create', label: 'Catat Peminjaman' },
        { id: 'loans.edit', label: 'Edit Peminjaman' }, // e.g. extend
        { id: 'loans.return', label: 'Proses Pengembalian' },
        { id: 'loans.fine', label: 'Kelola Denda' }
    ],
    'Anggota': [
        { id: 'members.view', label: 'Lihat Anggota' },
        { id: 'members.create', label: 'Daftar Anggota' },
        { id: 'members.edit', label: 'Edit Anggota' },
        { id: 'members.delete', label: 'Hapus Anggota' },
        { id: 'members.card', label: 'Cetak Kartu' }
    ],

    // --- LAPORAN ---
    'Laporan': [
        { id: 'reports.view', label: 'Akses Menu Laporan' }
    ],
    'Laporan Akademik': [
        { id: 'reports.academic.view', label: 'Lihat Laporam Akademik' },
        { id: 'reports.academic.print', label: 'Cetak Rapor' },
        { id: 'reports.academic.export', label: 'Export Ledger' }
    ],
    'Laporan Kesiswaan': [
        { id: 'reports.student.view', label: 'Lihat Laporan Kesiswaan' },
        { id: 'reports.student.export', label: 'Export Data' }
    ],

    // --- PENGATURAN ---
    'Pengaturan': [
        { id: 'settings.view', label: 'Lihat Pengaturan' },
        { id: 'settings.general', label: 'Pengaturan Umum' }, // Edit
        { id: 'settings.backup', label: 'Backup & Restore Database' },
        { id: 'settings.logs', label: 'Lihat System Logs' }
    ],
    'App Management': [
        { id: 'app.roles', label: 'Kelola Role & Permission' },
        { id: 'app.menus', label: 'Kelola Menu Aplikasi' }
    ],
    // For specific sub-view in settings if needed, though usually covered by above
    'Menu Management': [
        { id: 'menus.view', label: 'Lihat Menu' },
        { id: 'menus.manage', label: 'Kelola Struktur Menu' }
    ]
};

export default {
    async getRoles() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ data: [...mockRoles] });
            }, 500);
        });
    },

    async getRole(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const role = mockRoles.find(r => r.id == id);
                if (role) resolve({ data: role });
                else reject(new Error('Role not found'));
            }, 300);
        });
    },

    async createRole(roleData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newRole = {
                    id: mockRoles.length + 1,
                    ...roleData,
                    permissions: roleData.permissions || []
                };
                mockRoles.push(newRole);
                resolve({ data: newRole });
            }, 500);
        });
    },

    async updateRole(id, roleData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockRoles.findIndex(r => r.id == id);
                if (index !== -1) {
                    mockRoles[index] = { ...mockRoles[index], ...roleData };
                    resolve({ data: mockRoles[index] });
                } else {
                    reject(new Error('Role not found'));
                }
            }, 500);
        });
    },

    async deleteRole(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockRoles.findIndex(r => r.id == id);
                if (index !== -1) {
                    mockRoles.splice(index, 1);
                    resolve({ success: true });
                } else {
                    reject(new Error('Role not found'));
                }
            }, 500);
        });
    },

    async getPermissions() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ data: mockPermissions });
            }, 300);
        });
    },

    async createPermission(permissionData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { category, id, label } = permissionData;
                if (!mockPermissions[category]) {
                    mockPermissions[category] = [];
                }
                const newPermission = { id, label };
                mockPermissions[category].push(newPermission);
                resolve({ data: newPermission });
            }, 500);
        });
    },

    async updatePermission(oldId, permissionData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const { category, id, label, oldCategory } = permissionData;

                // 1. Remove from old category (or find where it is)
                let targetCat = oldCategory;
                if (!targetCat) {
                    for (const cat in mockPermissions) {
                        if (mockPermissions[cat].find(p => p.id === oldId)) {
                            targetCat = cat;
                            break;
                        }
                    }
                }

                if (targetCat && mockPermissions[targetCat]) {
                    const idx = mockPermissions[targetCat].findIndex(p => p.id === oldId);
                    if (idx !== -1) {
                        mockPermissions[targetCat].splice(idx, 1);
                        if (mockPermissions[targetCat].length === 0) delete mockPermissions[targetCat];
                    }
                }

                // 2. Add to new category
                if (!mockPermissions[category]) mockPermissions[category] = [];
                const updatedPermission = { id, label };
                mockPermissions[category].push(updatedPermission);

                resolve({ data: updatedPermission });
            }, 500);
        });
    },

    async deletePermission(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let deleted = false;
                for (const cat in mockPermissions) {
                    const index = mockPermissions[cat].findIndex(p => p.id === id);
                    if (index !== -1) {
                        mockPermissions[cat].splice(index, 1);
                        if (mockPermissions[cat].length === 0) delete mockPermissions[cat];
                        deleted = true;
                        break;
                    }
                }
                if (deleted) resolve({ success: true });
                else reject(new Error('Permission not found'));
            }, 500);
        });
    }
};
