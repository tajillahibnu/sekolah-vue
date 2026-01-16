import menuData from '@/data_dummy/menus.json';
import { createResponse } from '../utils';

export const menusHandler = (config) => {
    if (config.url === '/menus' && config.method === 'get') {
        return createResponse(menuData, 200, 'OK', {}, config);
    }
    return null;
};
