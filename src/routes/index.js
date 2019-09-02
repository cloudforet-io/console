import Vue from 'vue';
import Router from 'vue-router';
import { api } from '@/setup/api';
import url from 'url';

import { loadLanguageAsync } from '@/setup/i18n';
import store from '@/store';

let isFirstLogin = null;
let LoginType = null;
// Services
import dashboardRoute from '@/routes/dashboard/dashboard_route';
import identityRoute from '@/routes/identity/identity_route';
import inventoryRoute from '@/routes/inventory/inventory_route';

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer');

// Views
const LogIn = () => import('@/views/login/local/LOLO_001_LogIn');
const GoolgeLogIn = () => import('@/views/login/oauth/LOOA_001_LogInGoogleOauth');
const Redirect404 = () => import('@/views/common/VICO_003_Redirect404');

const attatchLangauge = (to, from, next) => {
    if (!to.params.lang) {
        next();
        return;
    }
    const lang = to.params.lang;
    loadLanguageAsync(lang).then(() => next());
    next();
};

Vue.use(Router);

const index = new Router({
    mode: 'history',
    linkActiveClass: 'open active',
    scrollBehavior: () => ({ y: 0 }),
    routes: [
        {
            path: '/error-page',
            name: 'error',
            meta: { label: '', requiresAuth: false, requiresDomainCheck: true },
            component: Redirect404
        },
        {
            path: '/log-in',
            name: 'logIn',
            meta: { label: 'Log In', requiresAuth: false, requiresDomainCheck: true },
            component: LogIn
        },
        {
            path: '/google-log-in',
            name: 'Google-Oauth-logIn',
            meta: { label: 'google_oauth2', requiresAuth: false, requiresDomainCheck: true },
            component: GoolgeLogIn
        },
        {
            path: '/',
            name: 'root',
            meta: { label: 'root', requiresDomainCheck: true },
            redirect: '/dashboard',
            component: DefaultContainer,
            children: [
                dashboardRoute,
                identityRoute,
                inventoryRoute
            ]
        }
    ]
});

index.beforeEach(async (to, from, next) => {
    if (isFirstLogin === null) {
        try {
            const parsedObject = url.parse(window.location.href).host;
            let domain_name = parsedObject.split('.');
            const response  = await api.post('/identity/domain/list', { name: domain_name[0] });
            if (response.data.total_count === 1){
                isFirstLogin = baseRedirectChecker(response);
            }
        } catch (error) {
            console.error('No valid Domain', error);
        }
    }

    for (let i = to.matched.length - 1; i > -1; i--) {
        if (to.matched[i].meta.requiresAuth) {
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
            return;
        }
        if (to.matched[i].meta.requiresDomainCheck) {
            if (isFirstLogin === 1) {
                to.matched[i].meta.requiresDomainCheck = false;
                next({
                    path: '/log-in'
                });
            } else  if (isFirstLogin  === 2 ){
                if (LoginType === 'google_oauth2'){
                    to.matched[i].meta.requiresDomainCheck = false;
                    next({
                        path: '/google-Log-in'
                    });
                } else {
                    to.matched[i].meta.requiresDomainCheck = false;
                    next({
                        path: '/error-page'
                    });
                }
            } else  if (isFirstLogin  === 3 ){
                to.matched[i].meta.requiresDomainCheck = false;
                next({
                    path: '/error-page'
                });
            }
            return;
        }
    }
    next();
});

function baseRedirectChecker(rep){
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
}

export default index;
