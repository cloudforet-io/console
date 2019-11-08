import store from '@/store';
import api from '@/lib/api';

export const beforeEach = async (to, from, next) => {
    if (to.meta && to.meta.excludeAuth !== true && !api.checkAccessToken()) {
        store.dispatch('auth/signOut');
        console.log('authType', store.getters['domain/authType'])
        const reDirectTo = store.getters['domain/authType'] !== 'local' ? { path: '/google-sign-in' } : { path: '/sign-in'}
        next(reDirectTo);
    }
    next();
};
