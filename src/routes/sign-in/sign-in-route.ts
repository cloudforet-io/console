import { RouteConfig } from 'vue-router';

const SignIn = () => import(/* webpackChunkName: "SignIn" */ '@/views/sign-in/pages/SignIn.vue');
const DomainAdminSignIn = () => import(/* webpackChunkName: "DomainAdminSignIn" */ '@/views/sign-in/pages/DomainAdminSignIn.vue');
const KeycloakPage = () => import(/* webpackChunkName: "KeycloakPage" */ '@/views/sign-in/external/KEYCLOAK/pages/KeycloakPage.vue');
const KB_SSO = () => import(/* webpackChunkName: "KB_SSO" */ '@/views/sign-in/external/KB_SSO/pages/KB_SSOPage.vue');

export const SIGN_IN_ROUTE = Object.freeze({
    _NAME: 'signIn',
    ADMIN: { _NAME: 'domainAdminSignIn' },
    KEYCLOAK: { _NAME: 'keycloak' },
    KB: { _NAME: 'KB_SSO', _PATH: 'kbfg-sso' },
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

export const kbSSORoute = {
    path: '/checkauth.jsp',
    name: SIGN_IN_ROUTE.KB._NAME,
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
} as RouteConfig;