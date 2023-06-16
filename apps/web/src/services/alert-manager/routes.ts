import type { RouteRecordRaw } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';

const AlertManagerContainer = () => import('@/services/alert-manager/AlertManagerContainer.vue');

const AlertDashboardPage = () => import('@/services/alert-manager/alert-dashboard/AlertDashboardPage.vue');
const AlertPage = () => import('@/services/alert-manager/alert/AlertPage.vue');
const EscalationPolicyPage = () => import('@/services/alert-manager/escalation-policy/EscalationPolicyPage.vue');
const AlertDetailPage = () => import('@/services/alert-manager/alert/alert-detail/AlertDetailPage.vue');

const alertManagerRoutes: RouteRecordRaw = {
    path: 'alert-manager',
    name: ALERT_MANAGER_ROUTE._NAME,
    meta: { menuId: MENU_ID.ALERT_MANAGER, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: () => getRedirectRouteByPagePermission(MENU_ID.ALERT_MANAGER, store.getters['user/pagePermissionMap']),
    component: AlertManagerContainer,
    children: [
        {
            path: 'dashboard',
            name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
            meta: { lnbVisible: true, menuId: MENU_ID.ALERT_MANAGER_DASHBOARD },
            component: AlertDashboardPage as any,
        },
        {
            path: 'alert',
            meta: { menuId: MENU_ID.ALERT_MANAGER_ALERT },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ALERT_MANAGER_ROUTE.ALERT._NAME,
                    meta: { lnbVisible: true },
                    component: AlertPage as any,
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
            meta: { lnbVisible: true, menuId: MENU_ID.ALERT_MANAGER_ESCALATION_POLICY },
            component: EscalationPolicyPage as any,
        },
    ],

};
export default alertManagerRoutes;
