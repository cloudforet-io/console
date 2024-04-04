import type { RouteConfig } from 'vue-router';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

const SignInContainer = () => import('@/services/auth/components/SignInContainer.vue');
const SignOutPage = () => import('@/services/auth/pages/SignOutPage.vue');
const SignInPage = () => import('@/services/auth/pages/SignInPage.vue');
const KeycloakPage = () => import('@/services/auth/pages/KeycloakPage.vue');
const KB_SSO = () => import('@/services/auth/pages/KB_SSOPage.vue');
const PasswordPage = () => import('@/services/auth/pages/PasswordPage.vue');
const ValidationEmailPage = () => import('@/services/auth/pages/ValidationEmailPage.vue');
const MultiFactorAuthPage = () => import('@/services/auth/pages/MultiFactorAuthPage.vue');

export default [
    {
        path: '/sign-out',
        name: AUTH_ROUTE.SIGN_OUT._NAME,
        component: SignOutPage,
        meta: {
            isSignInPage: false,
        },
    },
    {
        path: '/sign-in',
        meta: {
            isSignInPage: true,
        },
        component: SignInContainer,
        children: [
            {
                path: '/',
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
            {
                path: 'mfa',
                name: AUTH_ROUTE.SIGN_IN.MULTI_FACTOR_AUTH._NAME,
                meta: {
                    isSignInPage: true,
                },
                props: (route) => ({
                    nextPath: route.query.nextPath,
                }),
                component: MultiFactorAuthPage,
            },
        ],
    },
    {
        path: '/find-password',
        name: AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME,
        meta: {
            isSignInPage: false,
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
        },
        component: ValidationEmailPage,
    },
    {
        path: '/kbsso/checkauth.jsp',
        name: AUTH_ROUTE.SIGN_IN.KB._NAME,
        meta: {
            isSignInPage: true,
        },
        props: ({ query }) => ({
            secureToken: query.secureToken,
            secureSessionId: query.secureSessionId,
            resultCode: query.resultCode,
            nextPath: query.nextPath,
        }),
        component: KB_SSO,
    },
] as RouteConfig[];
