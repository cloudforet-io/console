import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';

const AlertManagerContainer = () => import('@/services/alert-manager/AlertManagerContainer.vue');

const AlertDashboardPage = () => import('@/services/alert-manager/pages/AlertDashboardPage.vue');
const AlertPage = () => import('@/services/alert-manager/pages/AlertPage.vue');
const EscalationPolicyPage = () => import('@/services/alert-manager/pages/EscalationPolicyPage.vue');
const AlertDetailPage = () => import('@/services/alert-manager/pages/AlertDetailPage.vue');

const alertManagerRoutes: RouteConfig = {
    path: 'alert-manager',
    name: ALERT_MANAGER_ROUTE._NAME,
    meta: { menuId: MENU_ID.ALERT_MANAGER, accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
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
            meta: { menuId: MENU_ID.ALERT },
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
            meta: { lnbVisible: true, menuId: MENU_ID.ESCALATION_POLICY },
            component: EscalationPolicyPage as any,
        },
    ],

};
export default alertManagerRoutes;
