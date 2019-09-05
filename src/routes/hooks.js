import url from 'url';
import { setApi, getApi } from '@/setup/api';
import store from '@/store';

const loginTypeEnum = Object.freeze({
    LOGOUT: null,
    LOCAL_LOGIN: 1,
    OAUTH_LOGIN: 2,
    DOMAIN_NOT_FOUND: 3
});

let isFirstLogin = null;
let LoginType = null;
let isNoApi = true;
let api = null;

const setOauth = async () => {
    let gapiScript = document.createElement('script');
    gapiScript.async = true;
    gapiScript.defer = true;
    await gapiScript.setAttribute('src', 'https://apis.google.com/js/platform.js');
    await document.head.appendChild(gapiScript);
};

const setDomainId = (domainId) => {
    sessionStorage.setItem('domainId', domainId);
};

const setAuthType = (domainOptions) => {
    store.commit('auth/setClientId', domainOptions.client_id );
    LoginType = domainOptions.auth_type;
};

const baseRedirectChecker = (domain) => {
    if (domain) {
        setDomainId(domain.domain_id);
        if (domain.plugin_info && domain.plugin_info.options && domain.plugin_info.options.auth_type) {
            setAuthType(domain.plugin_info.options);
            return loginTypeEnum.OAUTH_LOGIN;
        } else {
            return loginTypeEnum.LOCAL_LOGIN;
        } 
    } else {
        return loginTypeEnum.DOMAIN_NOT_FOUND;
    }
};


const getDomain = async () => {
    try {
        const parsedObject = url.parse(window.location.href).host;
        let domain_name = parsedObject.split('.');
        const response = await api.post('/identity/domain/list', { name: domain_name[0] });
        if (response.data.total_count === 1) {
            isFirstLogin = baseRedirectChecker(response.data.results[0]);
            if (isFirstLogin === loginTypeEnum.OAUTH_LOGIN) {
                await setOauth;
            }
        }
    } catch (error) {
        console.error('No valid Domain', error);
    }
};

const checkAccessToken = (to, from, next) => {
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
    if (isFirstLogin === loginTypeEnum.LOCAL_LOGIN) {
        meta.requiresDomainCheck = false;
        next({
            path: '/log-in'
        });
    } else  if (isFirstLogin  === loginTypeEnum.OAUTH_LOGIN ) {
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
    } else  if (isFirstLogin  === loginTypeEnum.DOMAIN_NOT_FOUND ) {
        meta.requiresDomainCheck = false;
        next({
            path: '/error-page'
        });
    }
};

export const beforeEach = async (to, from, next) => {
    console.log('beforeEach');
    if (isNoApi) {
        console.log('await setApi();');
        await setApi();
        console.log(' api = getApi();');
        api = getApi();
        isNoApi = false;
    }
    console.log('isFirstLogin', isFirstLogin);
    if (isFirstLogin === loginTypeEnum.LOGOUT) {
        await getDomain();
    }

    console.log('get to BeforeEach', isFirstLogin);
    for (let i = to.matched.length - 1; i > -1; i--) {
        
        if (to.matched[i].meta.requiresAuth) {
            checkAccessToken(to, from, next);
            return;
        }

        if (to.matched[i].meta.requiresDomainCheck) {
            checkDomain(to, from, next, to.matched[i].meta);
            return;
        }
    }
    console.log('before to BeforeEach', isFirstLogin);
    next();
};
