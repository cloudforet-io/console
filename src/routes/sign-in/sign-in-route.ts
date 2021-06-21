import { RouteConfig } from 'vue-router';

const SignIn = () => import(/* webpackChunkName: "SignIn" */ '@/views/sign-in/pages/SignIn.vue');
const DomainAdminSignIn = () => import(/* webpackChunkName: "DomainAdminSignIn" */ '@/views/sign-in/pages/DomainAdminSignIn.vue');
const KeycloakPage = () => import(/* webpackChunkName: "KeycloakPage" */ '@/views/sign-in/pages/KeycloakPage.vue');

export const SIGN_IN_ROUTE = Object.freeze({
    _NAME: 'signIn',
    ADMIN: { _NAME: 'domainAdminSignIn' },
    KEYCLOAK: { _NAME: 'keycloak' },
});

export default {
    path: '/sign-in',
    meta: {
        label: 'Sign In',
        excludeAuth: true,
        isSignInPage: true,
    },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: SIGN_IN_ROUTE._NAME,
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
            path: 'keycloak',
            name: SIGN_IN_ROUTE.KEYCLOAK._NAME,
            meta: {
                excludeAuth: true,
                isSignInPage: true,
            },
            props: route => ({
                nextPath: route.query.nextPath || '/',
            }),
            component: KeycloakPage,
        },
        {
            path: 'admin',
            name: SIGN_IN_ROUTE.ADMIN._NAME,
            meta: {
                excludeAuth: true,
                isSignInPage: true,
            },
            component: DomainAdminSignIn,
            props: route => ({
                admin: true,
                nextPath: route.query.nextPath || '/',
            }),
        },
    ],
} as RouteConfig;
