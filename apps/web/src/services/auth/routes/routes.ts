import type { RouteConfig } from 'vue-router';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

const SignInContainer = () => import('@/services/auth/components/SignInContainer.vue');
const SignOutPage = () => import('@/services/auth/pages/SignOutPage.vue');
const SignInPage = () => import('@/services/auth/pages/SignInPage.vue');
const KeycloakPage = () => import('@/services/auth/pages/KeycloakPage.vue');
const PasswordPage = () => import('@/services/auth/pages/PasswordPage.vue');
const ValidationEmailPage = () => import('@/services/auth/pages/ValidationEmailPage.vue');
const MultiFactorAuthPage = () => import('@/services/auth/pages/MultiFactorAuthPage.vue');
const MultiFactorAuthSetUpPage = () => import('@/services/auth/pages/MultiFactorAuthSetUpPage.vue');

const SamlRedirectPage = () => import('@/services/auth/pages/SamlRedirectPage.vue');

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
                    previousPath: route.query.previousPath,
                    redirectPath: route.query.redirectPath,
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
                    previousPath: route.query.previousPath,
                    redirectPath: route.query.redirectPath,
                }),
                component: KeycloakPage,
            },
            {
                path: 'mfa',
                name: AUTH_ROUTE.SIGN_IN.MULTI_FACTOR_AUTH._NAME,
                meta: {
                    isSignInPage: true,
                    isCentered: true,
                },
                props: (route) => ({
                    previousPath: route.query.previousPath,
                    redirectPath: route.query.redirectPath,
                }),
                component: MultiFactorAuthPage,
            },
            {
                path: 'mfa-setup/:mfaType',
                name: AUTH_ROUTE.SIGN_IN.MULTI_FACTOR_AUTH_SETUP._NAME,
                meta: {
                    isSignInPage: true,
                    isCentered: true,
                },
                props: (route) => ({
                    previousPath: route.query.previousPath,
                    redirectPath: route.query.redirectPath,
                }),
                component: MultiFactorAuthSetUpPage,
            },
        ],
    },
    {
        path: '/saml',
        name: AUTH_ROUTE.SAML._NAME,
        component: SamlRedirectPage,
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
] as RouteConfig[];
