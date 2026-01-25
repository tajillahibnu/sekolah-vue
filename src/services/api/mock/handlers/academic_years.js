import academicYearsData from '@/data_dummy/academic_years.json';
import { getStorageData, saveStorageData, createResponse, createError } from '../utils';

const STORAGE_KEY = 'academic_years_data';

export const academicYearsHandler = (config) => {
    const { url, method, data } = config;

    // GET /academic-years
    if ((url === '/academic-years' || url.startsWith('/academic-years?')) && method === 'get') {
        let items = getStorageData(STORAGE_KEY, academicYearsData);

        // Parse query params
        const urlObj = new URL(url, 'http://localhost');
        const q = urlObj.searchParams.get('q')?.toLowerCase();
        const page = parseInt(urlObj.searchParams.get('page')) || 1;
        const limit = parseInt(urlObj.searchParams.get('limit')) || 20;

        // Apply filters
        if (q) {
            items = items.filter(i =>
                i.name.toLowerCase().includes(q) ||
                i.semester.toLowerCase().includes(q)
            );
        }

        // Pagination
        const total = items.length;
        const startIndex = (page - 1) * limit;
        const paginatedItems = items.slice(startIndex, startIndex + limit);

        return createResponse({
            data: paginatedItems,
            meta: {
                total,
                page,
                limit,
                last_page: Math.ceil(total / limit)
            }
        }, 200, 'OK', {}, config);
    }

    // POST /academic-years
    if (url === '/academic-years' && method === 'post') {
        const items = getStorageData(STORAGE_KEY, academicYearsData);
        const payload = JSON.parse(data);

        // Basic Validation
        if (!payload.name || !payload.semester) {
            return createError('Name and Semester are required', 400, 'Bad Request', config);
        }

        const newItem = {
            ...payload,
            id: Math.max(...items.map(i => i.id), 0) + 1,
            status: payload.status || 'inactive'
        };

        // Logic: If setting as active, deactivate others? 
        // For simplicity let's allow manual control, but typically you'd deactivate others.
        // Let's implement deactivate others for convenience.
        if (newItem.status === 'active') {
            items.forEach(i => i.status = 'inactive');
        }

        items.push(newItem);
        saveStorageData(STORAGE_KEY, items);
        return createResponse({ data: newItem, message: 'Berhasil menambahkan tahun ajaran' }, 201, 'Created', {}, config);
    }

    // PUT /academic-years/:id
    if (url.startsWith('/academic-years/') && method === 'put') {
        const idStr = url.split('/')[2];
        const id = parseInt(idStr);
        if (!isNaN(id)) {
            const items = getStorageData(STORAGE_KEY, academicYearsData);
            const index = items.findIndex(i => i.id === id);

            if (index === -1) return createError('Academic Year not found', 404, 'Not Found', config);

            const payload = JSON.parse(data);

            // If setting as active, deactivate others
            if (payload.status === 'active' && items[index].status !== 'active') {
                items.forEach(i => i.status = 'inactive');
            }

            const updatedItem = {
                ...items[index],
                ...payload,
                id // Preserve ID
            };
            items[index] = updatedItem;
            saveStorageData(STORAGE_KEY, items);
            return createResponse({ data: updatedItem, message: 'Berhasil memperbarui tahun ajaran' }, 200, 'OK', {}, config);
        }
    }

    // DELETE /academic-years/:id
    if (url.startsWith('/academic-years/') && method === 'delete') {
        const idStr = url.split('/')[2];
        const id = parseInt(idStr);
        if (!isNaN(id)) {
            const items = getStorageData(STORAGE_KEY, academicYearsData);
            const index = items.findIndex(i => i.id === id);

            if (index === -1) return createError('Academic Year not found', 404, 'Not Found', config);

            const deletedItem = items[index];
            items.splice(index, 1);
            saveStorageData(STORAGE_KEY, items);
            return createResponse({ data: deletedItem, message: 'Berhasil menghapus tahun ajaran' }, 200, 'OK', {}, config);
        }
    }

    return null;
};
