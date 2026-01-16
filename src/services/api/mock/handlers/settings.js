// Import data dynamically handled in main handler to avoid circular dependencies or massive loads if preferred,
// but for simplicity we import them here.
import settingsUsersData from '@/features/settings/data/users.json';
import academicYearsData from '@/features/settings/data/academic-years.json';
import classesData from '@/features/settings/data/classes.json';
import subjectsData from '@/features/settings/data/subjects.json';
import schoolInfoData from '@/features/settings/data/school-info.json';

import { getStorageData, saveStorageData, createResponse } from '../utils';

export const settingsHandler = (config) => {
    const { url, method, data } = config;

    // --- USERS SETTINGS ---
    if (url.startsWith('/settings/users')) {
        const KEY = 'settings_users';
        const users = getStorageData(KEY, settingsUsersData);

        if (url === '/settings/users' && method === 'get') {
            return createResponse(users, 200, 'OK', {}, config);
        }
        if (url === '/settings/users' && method === 'post') {
            const newUser = JSON.parse(data);
            // Simple ID generation if needed, usually handled by form or here
            if (!newUser.id) newUser.id = Date.now().toString();
            users.push(newUser);
            saveStorageData(KEY, users);
            return createResponse(newUser, 201, 'Created', {}, config);
        }
        if (url.match(/\/settings\/users\/[^/]+/) && method === 'put') {
            const id = url.split('/')[3];
            const index = users.findIndex(u => String(u.id) === String(id));
            if (index !== -1) {
                users[index] = { ...users[index], ...JSON.parse(data) };
                saveStorageData(KEY, users);
                return createResponse(users[index], 200, 'OK', {}, config);
            }
        }
        if (url.match(/\/settings\/users\/[^/]+/) && method === 'delete') {
            const id = url.split('/')[3];
            const filtered = users.filter(u => String(u.id) !== String(id));
            saveStorageData(KEY, filtered);
            return createResponse({ success: true }, 200, 'OK', {}, config);
        }
    }

    // --- ACADEMIC YEARS ---
    if (url.startsWith('/settings/academic-years')) {
        const KEY = 'settings_academic_years';
        const years = getStorageData(KEY, academicYearsData);

        if (url === '/settings/academic-years' && method === 'get') {
            return createResponse(years, 200, 'OK', {}, config);
        }
        if (url === '/settings/academic-years' && method === 'post') {
            const newYear = JSON.parse(data);
            years.push(newYear);
            saveStorageData(KEY, years);
            return createResponse(newYear, 201, 'Created', {}, config);
        }
        if (method === 'put') {
            const id = url.split('/')[3];
            const index = years.findIndex(y => String(y.id) === String(id));
            if (index !== -1) {
                years[index] = { ...years[index], ...JSON.parse(data) };
                saveStorageData(KEY, years);
                return createResponse(years[index], 200, 'OK', {}, config);
            }
        }
        if (method === 'delete') {
            const id = url.split('/')[3];
            const filtered = years.filter(y => String(y.id) !== String(id));
            saveStorageData(KEY, filtered);
            return createResponse({ success: true }, 200, 'OK', {}, config);
        }
    }

    // --- CLASSES ---
    if (url.startsWith('/settings/classes')) {
        const KEY = 'settings_classes';
        const classes = getStorageData(KEY, classesData);

        if (url === '/settings/classes' && method === 'get') {
            return createResponse(classes, 200, 'OK', {}, config);
        }
        if (url === '/settings/classes' && method === 'post') {
            const newClass = JSON.parse(data);
            classes.push(newClass);
            saveStorageData(KEY, classes);
            return createResponse(newClass, 201, 'Created', {}, config);
        }
        if (method === 'put') {
            const id = url.split('/')[3];
            const index = classes.findIndex(c => String(c.id) === String(id));
            if (index !== -1) {
                classes[index] = { ...classes[index], ...JSON.parse(data) };
                saveStorageData(KEY, classes);
                return createResponse(classes[index], 200, 'OK', {}, config);
            }
        }
        if (method === 'delete') {
            const id = url.split('/')[3];
            const filtered = classes.filter(c => String(c.id) !== String(id));
            saveStorageData(KEY, filtered);
            return createResponse({ success: true }, 200, 'OK', {}, config);
        }
    }

    // --- SUBJECTS ---
    if (url.startsWith('/settings/subjects')) {
        const KEY = 'settings_subjects';
        const subjects = getStorageData(KEY, subjectsData);

        if (url === '/settings/subjects' && method === 'get') {
            return createResponse(subjects, 200, 'OK', {}, config);
        }
        if (url === '/settings/subjects' && method === 'post') {
            const newSubject = JSON.parse(data);
            subjects.push(newSubject);
            saveStorageData(KEY, subjects);
            return createResponse(newSubject, 201, 'Created', {}, config);
        }
        if (method === 'put') {
            const id = url.split('/')[3];
            const index = subjects.findIndex(s => String(s.id) === String(id));
            if (index !== -1) {
                subjects[index] = { ...subjects[index], ...JSON.parse(data) };
                saveStorageData(KEY, subjects);
                return createResponse(subjects[index], 200, 'OK', {}, config);
            }
        }
        if (method === 'delete') {
            const id = url.split('/')[3];
            const filtered = subjects.filter(s => String(s.id) !== String(id));
            saveStorageData(KEY, filtered);
            return createResponse({ success: true }, 200, 'OK', {}, config);
        }
    }

    // --- SCHOOL INFO ---
    if (url === '/settings/school') {
        const KEY = 'settings_school';
        if (method === 'get') {
            return createResponse(getStorageData(KEY, schoolInfoData), 200, 'OK', {}, config);
        }
        if (method === 'put') {
            const info = JSON.parse(data);
            saveStorageData(KEY, info);
            return createResponse(info, 200, 'OK', {}, config);
        }
    }

    // --- BACKUP & RESTORE ---
    if (url.startsWith('/settings/backups')) {
        const KEY = 'settings_backups';
        const initialBackups = [
            { id: '1', date: '2024-01-10T10:00:00Z', size: '2.4 MB', status: 'Success', version: 'v1.4.2' },
            { id: '2', date: '2024-01-15T08:30:00Z', size: '2.5 MB', status: 'Success', version: 'v1.4.3' }
        ];
        const backups = getStorageData(KEY, initialBackups);

        if (url === '/settings/backups' && method === 'get') {
            return createResponse(backups, 200, 'OK', {}, config);
        }
        if (url === '/settings/backups' && method === 'post') {
            const newBackup = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                size: (2 + Math.random()).toFixed(1) + ' MB',
                status: 'Success',
                version: 'v1.4.3'
            };
            backups.unshift(newBackup);
            saveStorageData(KEY, backups);
            return createResponse(newBackup, 201, 'Created', {}, config);
        }
        if (url.match(/\/settings\/backups\/[^/]+\/restore/) && method === 'post') {
            // Simulate restore
            return createResponse({ message: 'Databases restored successfully' }, 200, 'OK', {}, config);
        }
        if (url.match(/\/settings\/backups\/[^/]+/) && method === 'delete') {
            const id = url.split('/')[3];
            const filtered = backups.filter(b => String(b.id) !== String(id));
            saveStorageData(KEY, filtered);
            return createResponse({ success: true }, 200, 'OK', {}, config);
        }
    }

    // --- DATA EXCHANGE (EXPORT/IMPORT) ---
    if (url === '/settings/export' && method === 'post') {
        // Collect all potential local storage keys used by the app
        const keys = [
            'settings_users', 'settings_academic_years', 'settings_classes',
            'settings_subjects', 'settings_school', 'settings_backups',
            'students_data', 'employees_data'
        ];
        const exportData = {};
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) exportData[key] = JSON.parse(data);
        });

        return createResponse({
            data: exportData,
            filename: `sekolah_backup_${new Date().toISOString().split('T')[0]}.json`
        }, 200, 'OK', {}, config);
    }

    if (url === '/settings/import' && method === 'post') {
        const importData = JSON.parse(data);
        // Simple validation: check if it's an object
        if (typeof importData !== 'object' || importData === null) {
            return createResponse({ message: 'Invalid import format' }, 400, 'Bad Request', {}, config);
        }

        // Persist each key to localStorage
        Object.entries(importData).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
        });

        return createResponse({ message: 'Data imported successfully' }, 200, 'OK', {}, config);
    }

    return null;
};
