import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';

const AlertManagerContainer = () => import('@/services/alert-manager/AlertManagerContainer.vue');

const AlertDashboardPage = () => import('@/services/alert-manager/pages/AlertDashboardPage.vue');
const AlertMainPage = () => import('@/services/alert-manager/pages/AlertMainPage.vue');
const EscalationPolicyPage = () => import('@/services/alert-manager/pages/EscalationPolicyPage.vue');
const AlertDetailPage = () => import('@/services/alert-manager/pages/AlertDetailPage.vue');

const alertManagerRoutes: RouteConfig = {
    path: 'alert-manager',
    name: ALERT_MANAGER_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.ALERT_MANAGER,
        translationId: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
    component: AlertManagerContainer,
    children: [
        {
            path: 'dashboard',
            name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
            meta: {
                lnbVisible: true,
                menuId: MENU_ID.ALERT_MANAGER_DASHBOARD,
                translationId: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_DASHBOARD].translationId,
            },
            component: AlertDashboardPage as any,
        },
        {
            path: 'alert',
            meta: {
                menuId: MENU_ID.ALERT,
                translationId: MENU_INFO_MAP[MENU_ID.ALERT].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ALERT_MANAGER_ROUTE.ALERT._NAME,
                    meta: { lnbVisible: true, menuId: MENU_ID.ALERT },
                    component: AlertMainPage as any,
                },
                {
                    path: ':id?',
                    name: ALERT_MANAGER_ROUTE.ALERT.DETAIL._NAME,
                    meta: { lnbVisible: true, label: ({ params }) => params.id, copiable: true },
                    props: true,
                    component: AlertDetailPage as any,
                },
            ],
        },
        {
            path: 'escalation-policy',
            name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
            meta: {
                lnbVisible: true,
                menuId: MENU_ID.ESCALATION_POLICY,
                translationId: MENU_INFO_MAP[MENU_ID.ESCALATION_POLICY].translationId,
            },
            component: EscalationPolicyPage as any,
        },
    ],

};
export default alertManagerRoutes;
