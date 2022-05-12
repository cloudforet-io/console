import { RouteConfig } from 'vue-router';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { getMenuLabel } from '@/lib/menu/menu-info';
import { MENU_ID } from '@/lib/menu/config';
import { ROUTE_ACCESS_LEVEL } from '@/lib/access-control';

const AlertManagerContainer = () => import(/* webpackChunkName: "AlertManagerContainer" */ '@/services/alert-manager/AlertManagerContainer.vue');

const AlertDashboardPage = () => import(/* webpackChunkName: "AlertDashboardPage" */ '@/services/alert-manager/alert-dashboard/AlertDashboardPage.vue');
const AlertPage = () => import(/* webpackChunkName: "AlertPage" */ '@/services/alert-manager/alert/AlertPage.vue');
const EscalationPolicyPage = () => import(/* webpackChunkName: "EscalationPolicyPage" */ '@/services/alert-manager/escalation-policy/EscalationPolicyPage.vue');
const AlertDetailPage = () => import(/* webpackChunkName: "AlertDetailPage" */ '@/services/alert-manager/alert/alert-detail/AlertDetailPage.vue');

const alertManagerRoutes: RouteConfig = {
    path: 'alert-manager',
    name: ALERT_MANAGER_ROUTE._NAME,
    meta: { label: getMenuLabel(MENU_ID.ALERT_MANAGER), accessLevel: ROUTE_ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: '/alert-manager/dashboard',
    component: AlertManagerContainer,
    children: [
        {
            path: 'dashboard',
            name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
            meta: { lnbVisible: true, label: getMenuLabel(MENU_ID.ALERT_MANAGER_DASHBOARD) },
            component: AlertDashboardPage as any,
        },
        {
            path: 'alert',
            meta: { label: getMenuLabel(MENU_ID.ALERT_MANAGER_ALERT) },
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
            meta: { lnbVisible: true, label: getMenuLabel(MENU_ID.ALERT_MANAGER_ESCALATION_POLICY) },
            component: EscalationPolicyPage as any,
        },
    ],

};
export default alertManagerRoutes;
