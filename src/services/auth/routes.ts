import { RouteConfig } from 'vue-router';

import SignOutPage from '@/services/auth/sign-out/SignOutPage.vue';

const SignInPage = () => import(/* webpackChunkName: "SignInPage" */ '@/services/auth/sign-in/SignInPage.vue');
const DomainAdminSignInPage = () => import(/* webpackChunkName: "DomainAdminSignInPage" */ '@/services/auth/sign-in/DomainAdminSignInPage.vue');
const KeycloakPage = () => import(/* webpackChunkName: "KeycloakPage" */ '@/services/auth/sign-in/external/KEYCLOAK/pages/KeycloakPage.vue');
const KB_SSO = () => import(/* webpackChunkName: "KB_SSO" */ '@/services/auth/sign-in/external/KB_SSO/pages/KB_SSOPage.vue');

export const AUTH_ROUTE = Object.freeze({
    _NAME: 'auth',
    ADMIN_SIGN_IN: { _NAME: 'domainAdminSignIn' },
    SIGN_IN: {
        _NAME: 'signIn',
        KEYCLOAK: { _NAME: 'keycloak' },
        KB: { _NAME: 'KB_SSO', _PATH: 'kbfg-sso' },
    },
    SIGN_OUT: {
        _NAME: 'signOut',
    },

});

export default [
    {
        path: '/sign-out',
        name: AUTH_ROUTE.SIGN_OUT._NAME,
        component: SignOutPage,
        meta: { label: '', excludeAuth: true, isSignInPage: false },
    },
    {
        path: '/sign-in',
        meta: {
            excludeAuth: true,
            isSignInPage: true,
        },
        component: { template: '<router-view />' },
        children: [
            {
                path: '/',
                name: AUTH_ROUTE.SIGN_IN._NAME,
                meta: {
                    excludeAuth: true,
                    isSignInPage: true,

                },
                props: route => ({
                    nextPath: route.query.nextPath || '/',
                }),
                component: SignInPage,
            },
            {
                path: 'admin',
                name: AUTH_ROUTE.ADMIN_SIGN_IN._NAME,
                meta: {
                    excludeAuth: true,
                    isSignInPage: true,
                },
                component: DomainAdminSignInPage,
                props: route => ({
                    admin: true,
                    nextPath: route.query.nextPath || '/',
                }),
            },
            {
                path: 'keycloak',
                name: AUTH_ROUTE.SIGN_IN.KEYCLOAK._NAME,
                meta: {
                    excludeAuth: true,
                    isSignInPage: true,
                },
                props: route => ({
                    nextPath: route.query.nextPath || '/',
                }),
                component: KeycloakPage,
            },
        ],
    },
    {
        path: '/kbsso/checkauth.jsp',
        name: AUTH_ROUTE.SIGN_IN.KB._NAME,
        meta: {
            excludeAuth: true,
            isSignInPage: true,
        },
        props: ({ query }) => ({
            secureToken: query.secureToken,
            secureSessionId: query.secureSessionId,
            resultCode: query.resultCode,
            nextPath: query.nextPath || '/',
        }),
        component: KB_SSO,
    },
] as RouteConfig[];
