// Views
import ErrorPage from '@/views/common/pages/ErrorPage.vue';
import SignIn from '@/views/sign-in/Signin.vue';
import SignOut from '@/views/common/pages/SignOut.vue';

// Routes
import dashboardRoute from '@/routes/dashboard/dashboard-route';
import identityRoute from '@/routes/identity/identity-route';
import inventoryRoute from '@/routes/inventory/inventory-route';
import pluginRoute from '@/routes/plugin/plugin-route';
import projectRoute from '@/routes/project/project-route';
import managementRoute from '@/routes/management/management-route';
import automationRoute from '@/routes/automation/automation-route';
import { RouterOptions } from 'vue-router';


export const routerOptions = {
    mode: 'history',
    linkActiveClass: 'open active',
    routes: [
        {
            path: '/error-page',
            name: 'error',
            meta: { label: '', excludeAuth: true },
            component: ErrorPage,
        },
        {
            path: '/sign-in',
            component: { template: '<router-view />' },
            meta: {
                excludeAuth: true,
                isSignInPage: true,
            },
            children: [
                {
                    path: '/',
                    name: 'Login',
                    meta: {
                        excludeAuth: true,
                        isSignInPage: true,

                    },
                    props: route => ({
                        nextPath: route.query.nextPath || '/',
                    }),
                    component: SignIn,
                },
                {
                    path: 'admin',
                    name: 'AdminLogin',
                    meta: {
                        excludeAuth: true,
                        isSignInPage: true,
                    },
                    component: SignIn,
                    props: route => ({
                        admin: true,
                        nextPath: route.query.nextPath || '/',
                    }),
                },
            ],
        }, {
            path: '/sign-out/:authSystem',
            name: 'SignOut',
            component: SignOut,
            meta: { label: '', excludeAuth: true },
        },
        {
            path: '/',
            name: 'root',
            meta: { label: 'root' },
            redirect: '/dashboard',
            component: { template: '<router-view />' },
            children: [
                dashboardRoute,
                identityRoute,
                inventoryRoute,
                pluginRoute,
                projectRoute,
                managementRoute,
                automationRoute,
            ],
        },
        { path: '*', component: ErrorPage },
    ],
} as RouterOptions;
