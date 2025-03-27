import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ACCOUNT_TYPE_BADGE_OPTION } from '@/services/service-account/constants/service-account-constant';
import { ADMIN_SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/admin/route-constant';

const NoResourcePage = () => import('@/common/pages/NoResourcePage.vue');

const ServiceAccountContainer = () => import('@/services/service-account/ServiceAccountContainer.vue');
const ServiceAccountPage = () => import('@/services/service-account/pages/ServiceAccountPage.vue');
const ServiceAccountDetailPage = () => import('@/services/service-account/pages/ServiceAccountDetailPage.vue');
const ServiceAccountAddPage = () => import('@/services/service-account/pages/ServiceAccountAddPage.vue');


const adminServiceAccountRoute: RouteConfig = {
    path: 'service-account',
    meta: { menuId: MENU_ID.SERVICE_ACCOUNT, translationId: MENU_INFO_MAP[MENU_ID.SERVICE_ACCOUNT].translationId },
    component: ServiceAccountContainer,
    children: [
        {
            path: '/',
            name: ADMIN_SERVICE_ACCOUNT_ROUTE._NAME,
            meta: { menuId: MENU_ID.SERVICE_ACCOUNT },
            props: true,
            component: ServiceAccountPage as any,
        },
        {
            path: 'no-resource',
            name: ADMIN_SERVICE_ACCOUNT_ROUTE.NO_RESOURCE._NAME,
            meta: { translationId: 'COMMON.ERROR.NO_RESOURCE_TITLE' },
            component: NoResourcePage as any,
        },
        {
            path: ':serviceAccountId',
            name: ADMIN_SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
            meta: { label: ({ params }) => params.serviceAccountId, copiable: true },
            props: true,
            component: ServiceAccountDetailPage,
        },
        {
            path: 'add/:provider/:serviceAccountType',
            name: ADMIN_SERVICE_ACCOUNT_ROUTE.ADD._NAME,
            meta: {
                translationId: ({ params }) => (['IDENTITY.SERVICE_ACCOUNT.ADD.TITLE', {
                    type: ACCOUNT_TYPE_BADGE_OPTION[params.serviceAccountType].label,
                }]),
            },
            props: true,
            component: ServiceAccountAddPage as any,
        },
    ],
};

export default adminServiceAccountRoute;
