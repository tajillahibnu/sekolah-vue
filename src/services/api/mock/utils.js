// Helper functions for mock data persistence

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getStorageData = (key, defaultData) => {
    const stored = localStorage.getItem(key);
    if (stored) {
        return JSON.parse(stored);
    }
    // Deep copy default data to avoid reference issues
    const data = JSON.parse(JSON.stringify(defaultData));
    localStorage.setItem(key, JSON.stringify(data));
    return data;
};

export const saveStorageData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const createResponse = (data, status = 200, statusText = 'OK', headers = {}, config = {}) => {
    return {
        data,
        status,
        statusText,
        headers,
        config,
    };
};

export const createError = (message, status = 404, statusText = 'Not Found', config = {}) => {
    const error = new Error(message);
    error.response = {
        data: { message },
        status,
        statusText,
        headers: {},
        config,
    };
    return error;
};
