import studentsData from '@/features/students/data/students.json';
import { getStorageData, saveStorageData, createResponse, createError } from '../utils';

const STORAGE_KEY = 'students_data';

export const studentsHandler = (config) => {
    const { url, method, data } = config;

    // GET /students
    if (url.startsWith('/students') && method === 'get') {
        let students = getStorageData(STORAGE_KEY, studentsData);

        // Parse query params
        const urlObj = new URL(url, 'http://localhost');
        const q = urlObj.searchParams.get('q')?.toLowerCase();
        const className = urlObj.searchParams.get('class');
        const page = parseInt(urlObj.searchParams.get('page')) || 1;
        const limit = parseInt(urlObj.searchParams.get('limit')) || 20;

        // Apply filters
        if (q) {
            students = students.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                (s.nis && s.nis.includes(q))
            );
        }

        if (className) {
            students = students.filter(s => s.class === className);
        }

        // Pagination
        const total = students.length;
        const startIndex = (page - 1) * limit;
        const paginatedStudents = students.slice(startIndex, startIndex + limit);

        return createResponse({
            data: paginatedStudents,
            meta: {
                total,
                page,
                limit,
                last_page: Math.ceil(total / limit)
            }
        }, 200, 'OK', {}, config);
    }

    // POST /students
    if (url === '/students' && method === 'post') {
        const students = getStorageData(STORAGE_KEY, studentsData);
        const newStudent = {
            ...JSON.parse(data),
            id: Math.max(...students.map(s => s.id), 0) + 1
        };
        students.push(newStudent);
        saveStorageData(STORAGE_KEY, students);
        return createResponse(newStudent, 201, 'Created', {}, config);
    }

    // PUT /students/:id
    if (url.startsWith('/students/') && method === 'put') {
        const id = parseInt(url.split('/')[2]);
        const students = getStorageData(STORAGE_KEY, studentsData);
        const index = students.findIndex(s => s.id === id);

        if (index === -1) return createError('Student not found', 404, 'Not Found', config);

        const updatedStudent = {
            ...students[index],
            ...JSON.parse(data),
            id // Preserve ID
        };
        students[index] = updatedStudent;
        saveStorageData(STORAGE_KEY, students);
        return createResponse(updatedStudent, 200, 'OK', {}, config);
    }

    // DELETE /students/:id
    if (url.startsWith('/students/') && method === 'delete') {
        const id = parseInt(url.split('/')[2]);
        const students = getStorageData(STORAGE_KEY, studentsData);
        const index = students.findIndex(s => s.id === id);

        if (index === -1) return createError('Student not found', 404, 'Not Found', config);

        const deletedStudent = students[index];
        students.splice(index, 1);
        saveStorageData(STORAGE_KEY, students);
        return createResponse(deletedStudent, 200, 'OK', {}, config);
    }

    return null;
};
