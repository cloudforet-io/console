import type { RouteRecordRaw } from 'vue-router';

import { ACCESS_LEVEL } from '@/lib/access-control/config';

import { AUTH_ROUTE } from '@/services/auth/route-config';

const SignOutPage = () => import('@/services/auth/sign-out/SignOutPage.vue');
const SignInPage = () => import('@/services/auth/sign-in/SignInPage.vue');
const DomainAdminSignInPage = () => import('@/services/auth/sign-in/DomainAdminSignInPage.vue');
const KeycloakPage = () => import('@/services/auth/sign-in/external/KEYCLOAK/pages/KeycloakPage.vue');
const KB_SSO = () => import('@/services/auth/sign-in/external/KB_SSO/pages/KB_SSOPage.vue');
const PasswordPage = () => import('@/services/auth/password/PasswordPage.vue');
const ValidationEmailPage = () => import('@/services/auth/password/validation-email/ValidationEmailPage.vue');

export default [
    {
        path: '/sign-out',
        name: AUTH_ROUTE.SIGN_OUT._NAME,
        component: SignOutPage,
        meta: {
            isSignInPage: false, accessLevel: ACCESS_LEVEL.EXCLUDE_AUTH,
        },
    },
    {
        path: '/sign-in',
        meta: {
            isSignInPage: true,
            accessLevel: ACCESS_LEVEL.EXCLUDE_AUTH,
        },
        component: { template: '<router-view />' },
        children: [
            {
                path: '',
                name: AUTH_ROUTE.SIGN_IN._NAME,
                meta: {
                    isSignInPage: true,
                },
                props: (route) => ({
                    nextPath: route.query.nextPath,
                }),
                component: SignInPage,
            },
            {
                path: 'admin',
                name: AUTH_ROUTE.ADMIN_SIGN_IN._NAME,
                meta: {
                    isSignInPage: true,
                },
                component: DomainAdminSignInPage,
                props: (route) => ({
                    isDomainOwner: true,
                    nextPath: route.query.nextPath,
                }),
            },
            {
                path: 'keycloak',
                name: AUTH_ROUTE.SIGN_IN.KEYCLOAK._NAME,
                meta: {
                    isSignInPage: true,
                },
                props: (route) => ({
                    nextPath: route.query.nextPath,
                }),
                component: KeycloakPage,
            },
        ],
    },
    {
        path: '/find-password',
        name: AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME,
        meta: {
            isSignInPage: false,
            accessLevel: ACCESS_LEVEL.EXCLUDE_AUTH,
        },
        props: (route) => ({
            status: route.query.status || AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME,
        }),
        component: PasswordPage,
    },
    {
        path: '/reset-password',
        name: AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME,
        meta: {
            isSignInPage: false,
            accessLevel: ACCESS_LEVEL.EXCLUDE_AUTH,
        },
        props: (route) => ({
            status: route.query.status || AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME,
        }),
        component: PasswordPage,
    },
    {
        path: '/email',
        name: AUTH_ROUTE.EMAIL._NAME,
        meta: {
            isSignInPage: false,
            accessLevel: ACCESS_LEVEL.EXCLUDE_AUTH,
        },
        component: ValidationEmailPage,
    },
    {
        path: '/kbsso/checkauth.jsp',
        name: AUTH_ROUTE.SIGN_IN.KB._NAME,
        meta: {
            isSignInPage: true,
            accessLevel: ACCESS_LEVEL.EXCLUDE_AUTH,
        },
        props: ({ query }) => ({
            secureToken: query.secureToken,
            secureSessionId: query.secureSessionId,
            resultCode: query.resultCode,
            nextPath: query.nextPath,
        }),
        component: KB_SSO,
    },
] as RouteRecordRaw[];
