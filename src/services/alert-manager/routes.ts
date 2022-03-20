import { RouteConfig } from 'vue-router';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';

const AlertManagerPage = () => import(/* webpackChunkName: "AlertManagerPage" */ '@/services/alert-manager/AlertManagerPage.vue');
const AlertDashboardPage = () => import(/* webpackChunkName: "AlertDashboardPage" */ '@/services/alert-manager/alert-dashboard/AlertDashboardPage.vue');
const AlertPage = () => import(/* webpackChunkName: "AlertPage" */ '@/services/alert-manager/alert/AlertPage.vue');
const EscalationPolicyPage = () => import(/* webpackChunkName: "EscalationPolicyPage" */ '@/services/alert-manager/escalation-policy/EscalationPolicyPage.vue');
const AlertDetailPage = () => import(/* webpackChunkName: "AlertDetailPage" */ '@/services/alert-manager/alert/alert-detail/AlertDetailPage.vue');

export default {
    path: 'monitoring',
    name: ALERT_MANAGER_ROUTE._NAME,
    redirect: '/monitoring/alert-manager/dashboard',
    meta: { label: 'Monitoring' },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: ALERT_MANAGER_ROUTE.ALERT_MANAGER._NAME,
            redirect: 'dashboard',
            component: AlertManagerPage,
            children: [
                {
                    path: 'dashboard',
                    name: ALERT_MANAGER_ROUTE.ALERT_MANAGER.DASHBOARD._NAME,
                    component: AlertDashboardPage,
                },
                {
                    path: 'alert',
                    name: ALERT_MANAGER_ROUTE.ALERT_MANAGER.ALERT._NAME,
                    component: AlertPage,
                },
                {
                    path: 'escalation-policy',
                    name: ALERT_MANAGER_ROUTE.ALERT_MANAGER.ESCALATION_POLICY._NAME,
                    component: EscalationPolicyPage,
                },
            ],
        },
        {
            path: 'alert/:id',
            name: ALERT_MANAGER_ROUTE.ALERT_MANAGER.ALERT.DETAIL._NAME,
            props: true,
            component: AlertDetailPage,
        },
    ],
} as RouteConfig;
