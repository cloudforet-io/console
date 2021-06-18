import { RouteConfig } from 'vue-router';

const MonitoringMainPage = () => import(/* webpackChunkName: "MonitoringMainPage" */ '@/views/monitoring/alert/pages/MonitoringMainPage.vue');

const AlertDashboardPage = () => import(/* webpackChunkName: "AlertDashboardPage" */ '@/views/monitoring/alert/pages/AlertDashboardPage.vue');
const AlertListPage = () => import(/* webpackChunkName: "AlertListPage" */ '@/views/monitoring/alert/pages/AlertListPage.vue');
const EscalationPolicyPage = () => import(/* webpackChunkName: "EscalationPolicyPage" */ '@/views/monitoring/alert/pages/EscalationPolicyPage.vue');
const AlertDetailPage = () => import(/* webpackChunkName: "AlertDetailPage" */ '@/views/monitoring/alert/pages/AlertDetailPage.vue');

export const MONITORING_ROUTE = Object.freeze({
    _NAME: 'monitoring',
    ALERT_SYSTEM: {
        _NAME: 'alertSystem',
        DASHBOARD: { _NAME: 'alertDashboard' },
        ALERT: {
            _NAME: 'alertList',
            DETAIL: { _NAME: 'alertDetail' },
        },
        ESCALATION_POLICY: { _NAME: 'escalationPolicy' },
    },
});

export default {
    path: 'monitoring',
    name: MONITORING_ROUTE._NAME,
    redirect: '/monitoring/alert-system/dashboard',
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
                    name: MONITORING_ROUTE.ALERT_SYSTEM._NAME,
                    component: MonitoringMainPage,
                    children: [
                        {
                            path: 'dashboard',
                            name: MONITORING_ROUTE.ALERT_SYSTEM.DASHBOARD._NAME,
                            component: AlertDashboardPage,
                        },
                        {
                            path: 'alert',
                            name: MONITORING_ROUTE.ALERT_SYSTEM.ALERT._NAME,
                            component: AlertListPage,
                        },
                        {
                            path: 'escalation-policy',
                            name: MONITORING_ROUTE.ALERT_SYSTEM.ESCALATION_POLICY._NAME,
                            component: EscalationPolicyPage,
                        },
                    ],
                },
                {
                    path: 'alert/:id',
                    name: MONITORING_ROUTE.ALERT_SYSTEM.ALERT.DETAIL._NAME,
                    props: true,
                    component: AlertDetailPage,
                },
            ],
        },
    ],
} as RouteConfig;
