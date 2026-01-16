import referencesData from '@/data_dummy/references.json';
import { createResponse } from '../utils';

export const referencesHandler = (config) => {
    const { url, method, params } = config;

    // GET /references/religions
    if (url === '/references/religions' && method === 'get') {
        let data = referencesData.religions;

        // Server-side search simulation
        if (params && params.q) {
            const query = params.q.toLowerCase();
            data = data.filter(item => item.label.toLowerCase().includes(query));
        }

        // Limit simulation
        if (params && params.limit) {
            data = data.slice(0, parseInt(params.limit));
        }

        return createResponse(data, 200, 'OK', {}, config);
    }

    return null;
};
