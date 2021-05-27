import { RouteConfig } from 'vue-router';

const MonitoringMainPage = () => import(/* webpackChunkName: "MonitoringMainPage" */ '@/views/monitoring/alert/pages/MonitoringMainPage.vue');

const AlertDashboardPage = () => import(/* webpackChunkName: "AlertDashboardPage" */ '@/views/monitoring/alert/pages/AlertDashboardPage.vue');
const AlertListPage = () => import(/* webpackChunkName: "AlertListPage" */ '@/views/monitoring/alert/pages/AlertListPage.vue');
const EscalationPolicyPage = () => import(/* webpackChunkName: "EscalationPolicyPage" */ '@/views/monitoring/alert/pages/EscalationPolicyPage.vue');
const AlertDetailPage = () => import(/* webpackChunkName: "AlertDetailPage" */ '@/views/monitoring/alert/pages/AlertDetailPage.vue');

export const MONITORING_ROUTE = Object.freeze({
    MAIN: 'monitoring',
    ALERT_SYSTEM: {
        MAIN: 'alertDashboard',
        DASHBOARD: 'alertDashboard',
        ALERT: {
            LIST: 'alertList',
            DETAIL: 'alertDetail',
        },
        ESCALATION_POLICY: 'escalationPolicy',
    },
});

export default {
    path: 'monitoring',
    name: MONITORING_ROUTE.MAIN,
    redirect: '/monitoring/alert-system',
    meta: { label: 'Monitoring' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'alert-system',
            meta: { label: 'Alert System' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: MONITORING_ROUTE.ALERT_SYSTEM.MAIN,
                    component: MonitoringMainPage,
                    children: [
                        {
                            path: 'dashboard',
                            name: MONITORING_ROUTE.ALERT_SYSTEM.DASHBOARD,
                            component: AlertDashboardPage,
                        },
                        {
                            path: 'alert',
                            name: MONITORING_ROUTE.ALERT_SYSTEM.ALERT.LIST,
                            component: AlertListPage,
                        },
                        {
                            path: 'escalation-policy',
                            name: MONITORING_ROUTE.ALERT_SYSTEM.ESCALATION_POLICY,
                            component: EscalationPolicyPage,
                        },
                    ],
                },
                {
                    path: 'alert/:id',
                    name: MONITORING_ROUTE.ALERT_SYSTEM.ALERT.DETAIL,
                    props: true,
                    component: AlertDetailPage,
                },
            ],
        },
    ],
} as RouteConfig;
