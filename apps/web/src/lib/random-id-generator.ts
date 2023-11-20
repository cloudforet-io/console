import ErrorHandler from '@/common/composables/error/errorHandler';

const getRandomId = () => {
    try {
        if (window) return window.crypto.getRandomValues(new Uint32Array(1))[0];
        throw new Error('No window object found');
    } catch (e) {
        ErrorHandler.handleError(e);
        return Math.random();
    }
};

export default getRandomId;
