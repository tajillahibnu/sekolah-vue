const mockBulletins = [
    {
        id: 1,
        title: 'Edisi Spesial: Prestasi Gemilang Semester Ganjil',
        date: '24 Jan 2024',
        excerpt: 'Simak rangkuman prestasi siswa-siswi kita selama semester ini dari bidang akademik hingga non-akademik.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        category: 'Majalah',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop',
        author: 'Tim Redaksi',
        penName: 'Redaksi Utama',
        usePenName: true,
        views: 1240,
        isFeatured: true,
        status: 'published'
    },
    {
        id: 2,
        title: 'Karya Siswa: Puisi dan Cerpen Inspiratif',
        date: '20 Jan 2024',
        excerpt: 'Kumpulan karya sastra terbaik dari ekstrakurikuler Jurnalistik yang mengangkat tema tentang perjuangan.',
        content: 'Karya sastra adalah cerminan jiwa. Para siswa telah menuangkan kreativitas mereka dalam bentuk kata-kata yang indah dan menggugah hati.',
        category: 'Buletin',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop',
        author: 'Eskul Jurnalistik',
        penName: 'Pena Siswa',
        usePenName: true,
        views: 850,
        isFeatured: true,
        status: 'published'
    },
    {
        id: 3,
        title: 'Liputan Khusus: Hari Guru Nasional 2023 di Sekolah Kita',
        date: '15 Jan 2024',
        excerpt: 'Momen penuh haru dan kegembiraan di perayaan hari guru nasional ke-78 dengan berbagai pertunjukan menarik.',
        content: 'Perayaan tahun ini sangat meriah dengan partisipasi aktif seluruh warga sekolah. Penampilan spesial dari para siswa kelas 12 menjadi highlight utama.',
        category: 'Berita',
        type: 'video',
        mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb28f74b0cd?q=80&w=2070&auto=format&fit=crop',
        author: 'Staf Humas',
        penName: 'Humas Sekolah',
        usePenName: true,
        views: 2100,
        isFeatured: true,
        status: 'published'
    },
    {
        id: 4,
        title: 'Panduan Ekstrakurikuler Baru: Robotik & Coding',
        date: '10 Jan 2024',
        excerpt: 'Sekolah membuka cabang ekstrakurikuler baru untuk mengasah kemampuan teknologi masa depan.',
        content: 'Era digital menuntut kita untuk memiliki kemampuan teknis yang mumpuni. Robotik dan coding hadir sebagai wadah inovasi.',
        category: 'Majalah',
        type: 'video',
        mediaUrl: 'https://www.w3schools.com/html/movie.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop',
        author: 'Bidang Kesiswaan',
        penName: 'Kesiswaan Update',
        usePenName: true,
        views: 1560,
        status: 'published'
    },
    {
        id: 5,
        title: 'Selamat Datang Peserta Didik Baru Tahun Ajaran 2024/2025',
        date: '05 Jan 2024',
        excerpt: 'Penerimaan siswa baru telah dibuka. Mari bergabung dengan komunitas pembelajar yang dinamis dan berprestasi.',
        content: 'Selamat datang di rumah kedua Anda. Di sini kita akan belajar, tumbuh, dan menggapai cita-cita bersama-sama.',
        category: 'Berita',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1523050335456-c38a89b7848b?q=80&w=2070&auto=format&fit=crop',
        author: 'Panitia PPDB',
        penName: 'Admin PPDB',
        usePenName: true,
        views: 3200,
        status: 'published'
    },
    {
        id: 6,
        title: 'Tips Sukses Menghadapi Ujian Akhir Semester',
        date: '01 Jan 2024',
        excerpt: 'Berikut adalah kumpulan tips bimbingan konseling untuk membantu siswa tetap fokus dan tenang saat ujian.',
        content: 'Ujian bukan akhir dari segalanya, tapi kesempatan untuk menunjukkan apa yang telah kita pelajari.',
        category: 'Buletin',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop',
        author: 'BK Center',
        penName: 'Sahabat Siswa',
        usePenName: true,
        views: 940,
        status: 'published'
    }
];

export const bulletinService = {
    async getBulletins(params = {}) {
        const { page = 1, limit = 6, q = '', category = 'Semua', status = 'published', author = null } = params;

        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...mockBulletins];

                if (q) {
                    filtered = filtered.filter(b =>
                        b.title.toLowerCase().includes(q.toLowerCase()) ||
                        b.excerpt.toLowerCase().includes(q.toLowerCase())
                    );
                }

                if (category !== 'Semua') {
                    filtered = filtered.filter(b => b.category === category);
                }

                if (status !== 'all') {
                    filtered = filtered.filter(b => b.status === status);
                }

                if (author) {
                    filtered = filtered.filter(b => b.author === author);
                }

                const total = filtered.length;
                const start = (page - 1) * limit;
                const data = filtered.slice(start, start + limit);

                resolve({
                    data,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                });
            }, 500);
        });
    },

    async getBulletinById(id) {
        return new Promise((resolve) => {
            const item = mockBulletins.find(b => b.id === parseInt(id));
            setTimeout(() => resolve({ data: item }), 300);
        });
    },

    async createBulletin(payload) {
        return new Promise((resolve) => {
            const newBulletin = {
                id: mockBulletins.length + 1,
                ...payload,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                views: 0,
                isFeatured: false
            };
            mockBulletins.push(newBulletin);
            setTimeout(() => resolve({ data: newBulletin }), 500);
        });
    },

    async updateBulletinStatus(id, status, verifierNote = '') {
        return new Promise((resolve) => {
            const index = mockBulletins.findIndex(b => b.id === parseInt(id));
            if (index !== -1) {
                mockBulletins[index].status = status;
                if (verifierNote) {
                    mockBulletins[index].verifierNote = verifierNote;
                }
            }
            setTimeout(() => resolve({ success: true }), 300);
        });
    }
};

export default bulletinService;
