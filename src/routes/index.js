import Vue from 'vue';
import Router from 'vue-router';
import cookie from 'vue-cookie';

import { loadLanguageAsync } from '@/setup/i18n';
import store from '@/store';

// Services
import dashboardRoute from '@/routes/dashboard/dashboard_route';
import identityRoute from '@/routes/identity/identity_route';
import inventoryRoute from '@/routes/inventory/inventory_route';

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer');

// Views
const LogIn = () => import('@/views/common/VICO_002_LogIn');

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
            path: '/log-in',
            name: 'logIn',
            meta: { label: 'Log In', requiresAuth: false },
            component: LogIn
        },
        {
            path: '/',
            name: 'root',
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

index.beforeEach((to, from, next) => {
    for (var i = to.matched.length - 1; i > -1; i--) {
        if (to.matched[i].meta.requiresAuth) {
            if (sessionStorage.getItem('token')) {
                store.dispatch('auth/setUsername', { username: sessionStorage.getItem('username') });
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
    }
    next();
});

export default index;
