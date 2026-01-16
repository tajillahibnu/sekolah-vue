import employeesData from '@/features/employees/data/employees.json';
import { getStorageData, saveStorageData, createResponse, createError } from '../utils';

const STORAGE_KEY = 'employees_data_v2';

export const employeesHandler = (config) => {
    const { url, method, data } = config;

    // GET /employees
    if (url.startsWith('/employees') && method === 'get') {
        let employees = getStorageData(STORAGE_KEY, employeesData);

        // Parse query params
        const urlObj = new URL(url, 'http://localhost');
        const q = urlObj.searchParams.get('q')?.toLowerCase();
        const page = parseInt(urlObj.searchParams.get('page')) || 1;
        const limit = parseInt(urlObj.searchParams.get('limit')) || 20;

        // Apply filters
        if (q) {
            employees = employees.filter(e =>
                e.name.toLowerCase().includes(q) ||
                e.nip.toLowerCase().includes(q) ||
                (e.email && e.email.toLowerCase().includes(q))
            );
        }

        // Pagination
        const total = employees.length;
        const startIndex = (page - 1) * limit;
        const paginatedEmployees = employees.slice(startIndex, startIndex + limit);

        return createResponse({
            data: paginatedEmployees,
            meta: {
                total,
                page,
                limit,
                last_page: Math.ceil(total / limit)
            }
        }, 200, 'OK', {}, config);
    }

    // POST /employees
    if (url === '/employees' && method === 'post') {
        const employees = getStorageData(STORAGE_KEY, employeesData);
        const newEmployee = JSON.parse(data);
        // Generate simple ID
        newEmployee.id = Math.max(...employees.map(e => e.id), 0) + 1;

        employees.push(newEmployee);
        saveStorageData(STORAGE_KEY, employees);
        return createResponse(newEmployee, 201, 'Created', {}, config);
    }

    // PUT /employees/:id
    if (url.startsWith('/employees/') && method === 'put') {
        const id = parseInt(url.split('/')[2]);
        const employees = getStorageData(STORAGE_KEY, employeesData);
        const index = employees.findIndex(e => e.id === id);

        if (index === -1) return createError('Employee not found', 404, 'Not Found', config);

        const updatedEmployee = {
            ...employees[index],
            ...JSON.parse(data),
            id // Preserve ID
        };
        employees[index] = updatedEmployee;
        saveStorageData(STORAGE_KEY, employees);
        return createResponse(updatedEmployee, 200, 'OK', {}, config);
    }

    // DELETE /employees/:id
    if (url.startsWith('/employees/') && method === 'delete') {
        const id = parseInt(url.split('/')[2]);
        const employees = getStorageData(STORAGE_KEY, employeesData);
        const index = employees.findIndex(e => e.id === id);

        if (index === -1) return createError('Employee not found', 404, 'Not Found', config);

        const deletedEmployee = employees[index];
        employees.splice(index, 1);
        saveStorageData(STORAGE_KEY, employees);
        return createResponse(deletedEmployee, 200, 'OK', {}, config);
    }

    return null;
};
