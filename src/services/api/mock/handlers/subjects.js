import subjectsData from '@/data_dummy/subjects.json';
import { getStorageData, saveStorageData, createResponse, createError } from '../utils';

const STORAGE_KEY = 'subjects_data';

export const subjectsHandler = (config) => {
    const { url, method, data } = config;

    // GET /subjects
    if (url.startsWith('/subjects') && method === 'get') {
        const urlPart = url.split('?')[0]; // Handle query parameters in URL check if needed, but simple startswith handles it
        // Check filtering for specific ID (GET /subjects/:id) - wait, this block handles list and might handle detail if I add logic, 
        // but typically DETAIL is separate block or regex.
        // Let's stick to list first.
        
        // Exact match for list or detail?
        // If url is exactly /subjects or /subjects?q=...
        if (urlPart === '/subjects' || urlPart === '/subjects/') {
            let subjects = getStorageData(STORAGE_KEY, subjectsData);

            // Parse query params
            const urlObj = new URL(url, 'http://localhost');
            const q = urlObj.searchParams.get('q')?.toLowerCase();
            const page = parseInt(urlObj.searchParams.get('page')) || 1;
            const limit = parseInt(urlObj.searchParams.get('limit')) || 20;

            // Apply filters
            if (q) {
                subjects = subjects.filter(s =>
                    s.name.toLowerCase().includes(q) ||
                    s.code.toLowerCase().includes(q)
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
        
        // GET /subjects/:id
        const detailMatch = url.match(/^\/subjects\/(\d+)$/);
        if (detailMatch) {
            const id = parseInt(detailMatch[1]);
            const subjects = getStorageData(STORAGE_KEY, subjectsData);
            const subject = subjects.find(s => s.id === id);
            
            if (!subject) return createError('Subject not found', 404, 'Not Found', config);
            
            return createResponse({ data: subject }, 200, 'OK', {}, config);
        }
    }

    // POST /subjects
    if (url === '/subjects' && method === 'post') {
        const subjects = getStorageData(STORAGE_KEY, subjectsData);
        // Basic validation
        const payload = JSON.parse(data);
        if (!payload.name || !payload.code) {
             return createError('Name and Code are required', 400, 'Bad Request', config);
        }

        const newSubject = {
            ...payload,
            id: Math.max(...subjects.map(s => s.id), 0) + 1,
            status: payload.status || 'active'
        };
        subjects.push(newSubject);
        saveStorageData(STORAGE_KEY, subjects);
        return createResponse({ data: newSubject, message: 'Berhasil menambahkan mata pelajaran' }, 201, 'Created', {}, config);
    }

    // PUT /subjects/:id
    if (url.startsWith('/subjects/') && method === 'put') {
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

    // DELETE /subjects/:id
    if (url.startsWith('/subjects/') && method === 'delete') {
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
