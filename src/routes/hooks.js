import url from 'url';
import { setApi, getApi } from '@/setup/api';
import store from '@/store';

let isFirstLogin = null;
let LoginType = null;
let isNoApi = true;
let api = null;

const setOauth = async () => {
    let gapiScript = document.createElement('script');
    await gapiScript.setAttribute('src', 'https://apis.google.com/js/platform.js');
    //gapiScript.async = true;
    //gapiScript.defer = true;
    await document.head.appendChild(gapiScript);
};

const baseRedirectChecker = (rep) => {
    let response = rep.data;
    if (response.total_count > 0) {
        let result = response.results[0];
        sessionStorage.setItem('domainId', result.domain_id);
        if (!result.plugin_info ||
            !result.plugin_info.options ||
            !result.plugin_info.options.auth_type ) {
            return 1;
        } else {
            store.commit('auth/setClientId', result.plugin_info.options.client_id );
            LoginType = result.plugin_info.options.auth_type;
            return 2;
        }
    } else {
        return 3;
    }
};

const getDomain = async () => {
    try {
        const parsedObject = url.parse(window.location.href).host;
        let domain_name = parsedObject.split('.');
        const response  = await api.post('/identity/domain/list', { name: domain_name[0] });
        if (response.data.total_count === 1) {
            isFirstLogin = baseRedirectChecker(response);
            if (isFirstLogin === 2){
                await setOauth;
            }
        }
    } catch (error) {
        console.error('No valid Domain', error);
    }
};

const checkAuth = (to, from, next) => {
    if (sessionStorage.getItem('token')) {
        store.dispatch('auth/setUserId', { userId: sessionStorage.getItem('userId') });
        store.dispatch('auth/setToken', { token: sessionStorage.getItem('token') });
        next();
    } else {
        store.dispatch('auth/setNextPath', { nextPath: to.fullPath });
        next({
            path: '/log-in'
        });
    }
};

const checkDomain = (to, from, next, meta) => {
    if (isFirstLogin === 1) {
        meta.requiresDomainCheck = false;
        next({
            path: '/log-in'
        });
    } else  if (isFirstLogin  === 2 ) {
        if (LoginType === 'google_oauth2') {
            meta.requiresDomainCheck = false;
            next({
                path: '/google-Log-in'
            });
        } else {
            meta.requiresDomainCheck = false;
            next({
                path: '/error-page'
            });
        }
    } else  if (isFirstLogin  === 3 ) {
        meta.requiresDomainCheck = false;
        next({
            path: '/error-page'
        });
    }
};

export const beforeEach = async (to, from, next) => {
    if (isNoApi) {
        await setApi();
        api = getApi();
    }

    if (isFirstLogin === null) {
        await getDomain();
    }

    for (let i = to.matched.length - 1; i > -1; i--) {
        if (to.matched[i].meta.requiresAuth) {
            checkAuth(to, from, next);
            return;
        }
        
        if (to.matched[i].meta.requiresDomainCheck) {
            checkDomain(to, from, next, to.matched[i].meta);
            return;
        }
    }
    next();
};