import subjectsData from '@/data_dummy/subjects.json';
import { getStorageData, saveStorageData, createResponse, createError } from '../utils';

const STORAGE_KEY = 'mata_pelajaran_data';

export const mataPelajaranHandler = (config) => {
    const { url, method, data } = config;

    // GET /mata-pelajaran
    if (url.startsWith('/mata-pelajaran') && method === 'get') {
        const urlPart = url.split('?')[0];
        // Check filtering for specific ID (GET /mata-pelajaran/:id)

        // Exact match for list or detail?
        // If url is exactly /subjects or /subjects?q=...
        if (urlPart === '/mata-pelajaran' || urlPart === '/mata-pelajaran/') {
            let subjects = getStorageData(STORAGE_KEY, subjectsData);

            // Parse query params
            const urlObj = new URL(url, 'http://localhost');
            const q = urlObj.searchParams.get('q')?.toLowerCase();
            const page = parseInt(urlObj.searchParams.get('page')) || 1;
            const limit = parseInt(urlObj.searchParams.get('limit')) || 20;

            // Apply filters
            if (q) {
                subjects = subjects.filter(s =>
                    s.nama.toLowerCase().includes(q) ||
                    s.kode.toLowerCase().includes(q)
                );
            }

            // Pagination
            const total = subjects.length;
            const startIndex = (page - 1) * limit;
            const paginatedSubjects = subjects.slice(startIndex, startIndex + limit);

            return createResponse({
                data: paginatedSubjects,
                meta: {
                    total,
                    page,
                    limit,
                    last_page: Math.ceil(total / limit)
                }
            }, 200, 'OK', {}, config);
        }

        // GET /mata-pelajaran/:id
        const detailMatch = url.match(/^\/mata-pelajaran\/(\d+)$/);
        if (detailMatch) {
            const id = parseInt(detailMatch[1]);
            const subjects = getStorageData(STORAGE_KEY, subjectsData);
            const subject = subjects.find(s => s.id === id);

            if (!subject) return createError('Subject not found', 404, 'Not Found', config);

            return createResponse({ data: subject }, 200, 'OK', {}, config);
        }
    }

    // POST /mata-pelajaran
    if (url === '/mata-pelajaran' && method === 'post') {
        const subjects = getStorageData(STORAGE_KEY, subjectsData);
        // Basic validation
        const payload = JSON.parse(data);
        if (!payload.nama || !payload.kode) {
            return createError('Nama dan Kode wajib diisi', 400, 'Bad Request', config);
        }

        // Check for duplicate code (Simulate 422)
        if (subjects.some(s => s.kode === payload.kode)) {
            return createError('The kode has already been taken.', 422, 'Unprocessable Content', {
                errors: {
                    kode: ['The kode has already been taken.']
                }
            }, config);
        }

        const newSubject = {
            ...payload,
            id: Math.max(...subjects.map(s => s.id), 0) + 1,
            is_aktif: payload.is_aktif ?? true
        };
        subjects.push(newSubject);
        saveStorageData(STORAGE_KEY, subjects);
        return createResponse({ data: newSubject, message: 'Berhasil menambahkan mata pelajaran' }, 201, 'Created', {}, config);
    }

    // PUT /mata-pelajaran/:id
    if (url.startsWith('/mata-pelajaran/') && method === 'put') {
        const idStr = url.split('/')[2];
        const id = parseInt(idStr);
        if (!isNaN(id)) {
            const subjects = getStorageData(STORAGE_KEY, subjectsData);
            const index = subjects.findIndex(s => s.id === id);

            if (index === -1) return createError('Subject not found', 404, 'Not Found', config);

            const updatedSubject = {
                ...subjects[index],
                ...JSON.parse(data),
                id // Preserve ID
            };
            subjects[index] = updatedSubject;
            saveStorageData(STORAGE_KEY, subjects);
            return createResponse({ data: updatedSubject, message: 'Berhasil memperbarui mata pelajaran' }, 200, 'OK', {}, config);
        }
    }

    // DELETE /mata-pelajaran/:id
    if (url.startsWith('/mata-pelajaran/') && method === 'delete') {
        const idStr = url.split('/')[2];
        const id = parseInt(idStr);
        if (!isNaN(id)) {
            const subjects = getStorageData(STORAGE_KEY, subjectsData);
            const index = subjects.findIndex(s => s.id === id);

            if (index === -1) return createError('Subject not found', 404, 'Not Found', config);

            const deletedSubject = subjects[index];
            subjects.splice(index, 1);
            saveStorageData(STORAGE_KEY, subjects);
            return createResponse({ data: deletedSubject, message: 'Berhasil menghapus mata pelajaran' }, 200, 'OK', {}, config);
        }
    }

    return null;
};
