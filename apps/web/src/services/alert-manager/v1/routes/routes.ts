import type { RouteConfig } from 'vue-router';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ALERT_MANAGER_ROUTE_V1 } from '@/services/alert-manager/v1/routes/route-constant';

const AlertManagerContainer = () => import('@/services/alert-manager/v1/AlertManagerContainer.vue');

const AlertDashboardPage = () => import('@/services/alert-manager/v1/pages/AlertDashboardPage.vue');
const AlertMainPage = () => import('@/services/alert-manager/v1/pages/AlertMainPage.vue');
const EscalationPolicyPage = () => import('@/services/alert-manager/v1/pages/EscalationPolicyPage.vue');
const AlertDetailPage = () => import('@/services/alert-manager/v1/pages/AlertDetailPage.vue');


const alertManagerRoute: RouteConfig = {
    path: 'alert-manager-v1',
    name: ALERT_MANAGER_ROUTE_V1._NAME,
    meta: {
        menuId: MENU_ID.ALERT_MANAGER,
        translationId: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to),
    component: AlertManagerContainer,
    children: [
        {
            path: 'dashboard',
            name: ALERT_MANAGER_ROUTE_V1.DASHBOARD._NAME,
            meta: {
                menuId: MENU_ID.ALERT_MANAGER_DASHBOARD,
                translationId: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_DASHBOARD].translationId,
            },
            component: AlertDashboardPage as any,
        },
        {
            path: 'alert',
            meta: {
                menuId: MENU_ID.ALERTS,
                translationId: MENU_INFO_MAP[MENU_ID.ALERTS].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ALERT_MANAGER_ROUTE_V1.ALERTS._NAME,
                    meta: { menuId: MENU_ID.ALERTS },
                    component: AlertMainPage as any,
                },
                {
                    path: ':id?',
                    name: ALERT_MANAGER_ROUTE_V1.ALERTS.DETAIL._NAME,
                    meta: { label: ({ params }) => params.id, copiable: true },
                    props: true,
                    component: AlertDetailPage as any,
                },
            ],
        },
        {
            path: 'escalation-policy',
            name: ALERT_MANAGER_ROUTE_V1.ESCALATION_POLICY._NAME,
            meta: {
                menuId: MENU_ID.ESCALATION_POLICY,
                translationId: MENU_INFO_MAP[MENU_ID.ESCALATION_POLICY].translationId,
            },
            component: EscalationPolicyPage as any,
        },
    ],

};
export default alertManagerRoute;
