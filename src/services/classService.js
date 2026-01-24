import classesData from '@/data_dummy/classes.json';

// In-memory store for development
let mockClasses = [...classesData];

export default {
    /**
     * Get all classes with optional filters
     * @param {Object} filters - { grade, academicYear, jurusan, status, search }
     * @returns {Promise<Object>} - { data: Class[] }
     */
    async getClasses(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                let classes = [...mockClasses];

                // Apply filters
                if (filters.grade) {
                    classes = classes.filter(c => c.grade === parseInt(filters.grade));
                }
                if (filters.academicYear) {
                    classes = classes.filter(c => c.academicYear === filters.academicYear);
                }
                if (filters.jurusan) {
                    classes = classes.filter(c => c.jurusan === filters.jurusan);
                }
                if (filters.status) {
                    classes = classes.filter(c => c.status === filters.status);
                }
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    classes = classes.filter(c =>
                        c.name.toLowerCase().includes(searchLower) ||
                        (c.jurusan && c.jurusan.toLowerCase().includes(searchLower)) ||
                        (c.homeRoomTeacher && c.homeRoomTeacher.toLowerCase().includes(searchLower))
                    );
                }

                resolve({ data: classes });
            }, 300);
        });
    },

    /**
     * Get single class by ID
     * @param {number} id - Class ID
     * @returns {Promise<Object>} - { data: Class }
     */
    async getClassById(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const classData = mockClasses.find(c => c.id === parseInt(id));
                if (classData) {
                    resolve({ data: classData });
                } else {
                    reject(new Error('Kelas tidak ditemukan'));
                }
            }, 200);
        });
    },

    /**
     * Create new class
     * @param {Object} classData - Class data
     * @returns {Promise<Object>} - { data: Class }
     */
    async createClass(classData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newClass = {
                    id: Math.max(...mockClasses.map(c => c.id), 0) + 1,
                    ...classData,
                    currentStudents: 0,
                    status: 'active'
                };
                mockClasses.push(newClass);
                resolve({ data: newClass });
            }, 400);
        });
    },

    /**
     * Update existing class
     * @param {number} id - Class ID
     * @param {Object} classData - Updated class data
     * @returns {Promise<Object>} - { data: Class }
     */
    async updateClass(id, classData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockClasses.findIndex(c => c.id === parseInt(id));
                if (index !== -1) {
                    mockClasses[index] = {
                        ...mockClasses[index],
                        ...classData,
                        id: mockClasses[index].id // Preserve ID
                    };
                    resolve({ data: mockClasses[index] });
                } else {
                    reject(new Error('Kelas tidak ditemukan'));
                }
            }, 400);
        });
    },

    /**
     * Delete class
     * @param {number} id - Class ID
     * @returns {Promise<Object>} - { success: boolean }
     */
    async deleteClass(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockClasses.findIndex(c => c.id === parseInt(id));
                if (index !== -1) {
                    // Check if class has students
                    if (mockClasses[index].currentStudents > 0) {
                        reject(new Error('Tidak dapat menghapus kelas yang masih memiliki siswa. Pindahkan siswa terlebih dahulu.'));
                        return;
                    }
                    mockClasses.splice(index, 1);
                    resolve({ success: true });
                } else {
                    reject(new Error('Kelas tidak ditemukan'));
                }
            }, 400);
        });
    },

    /**
     * Get available jurusan list (for SMK)
     * @returns {Promise<Object>} - { data: string[] }
     */
    async getJurusanList() {
        return new Promise(resolve => {
            setTimeout(() => {
                const jurusanList = [
                    'Teknik Komputer dan Jaringan',
                    'Rekayasa Perangkat Lunak',
                    'Multimedia',
                    'Teknik Kendaraan Ringan',
                    'Teknik Sepeda Motor',
                    'Akuntansi dan Keuangan Lembaga',
                    'Bisnis Daring dan Pemasaran',
                    'Otomasi dan Tata Kelola Perkantoran'
                ];
                resolve({ data: jurusanList });
            }, 200);
        });
    },

    /**
     * Get classes with available capacity
     * @param {number} minCapacity - Minimum available capacity needed
     * @returns {Promise<Object>} - { data: Class[] }
     */
    async getAvailableClasses(minCapacity = 1) {
        return new Promise(resolve => {
            setTimeout(() => {
                const availableClasses = mockClasses.filter(c =>
                    c.status === 'active' &&
                    (c.capacity - c.currentStudents) >= minCapacity
                );
                resolve({ data: availableClasses });
            }, 300);
        });
    }
};
