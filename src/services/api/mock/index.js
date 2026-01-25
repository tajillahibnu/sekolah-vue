import { delay, createError } from './utils';
import { authHandler } from './handlers/auth';
import { menusHandler } from './handlers/menus';
import { studentsHandler } from './handlers/students';
import { settingsHandler } from './handlers/settings';
import { usersHandler } from './handlers/users';
import { employeesHandler } from './handlers/employees';
import { referencesHandler } from './handlers/references';
import { dashboardHandler } from './handlers/dashboard';
import { subjectsHandler } from './handlers/subjects';

const handlers = [
    authHandler,
    menusHandler,
    dashboardHandler,
    studentsHandler,
    settingsHandler,

    usersHandler,
    employeesHandler,
    referencesHandler,
    subjectsHandler
];

export const mockAdapter = async (config) => {
    // Artificial latency
    await delay(500);

    for (const handler of handlers) {
        const response = handler(config);
        if (response) {
            return response;
        }
    }

    throw createError('Request failed with status code 404 (Mock)', 404);
};
