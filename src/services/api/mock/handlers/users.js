import usersData from '@/data_dummy/users.json';
import { createResponse } from '../utils';

export const usersHandler = (config) => {
    if (config.url === '/users' && config.method === 'get') {
        return createResponse(usersData, 200, 'OK', {}, config);
    }
    return null;
};
