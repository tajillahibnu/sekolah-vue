import loginData from '@/data_dummy/login.json';
import { createResponse } from '../utils';

export const authHandler = (config) => {
    if (config.url === '/login' && config.method === 'post') {
        return createResponse(loginData, 200, 'OK', {}, config);
    }
    return null;
};
