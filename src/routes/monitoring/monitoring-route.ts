import { RouteConfig } from 'vue-router';

const MonitoringMainPage = () => import(/* webpackChunkName: "MonitoringMainPage" */ '@/views/monitoring/alert-manager/pages/MonitoringMainPage.vue');

const AlertDashboardPage = () => import(/* webpackChunkName: "AlertDashboardPage" */ '@/views/monitoring/alert-manager/pages/AlertDashboardPage.vue');
const AlertListPage = () => import(/* webpackChunkName: "AlertListPage" */ '@/views/monitoring/alert-manager/pages/AlertListPage.vue');
const EscalationPolicyPage = () => import(/* webpackChunkName: "EscalationPolicyPage" */ '@/views/monitoring/alert-manager/pages/EscalationPolicyPage.vue');
const AlertDetailPage = () => import(/* webpackChunkName: "AlertDetailPage" */ '@/views/monitoring/alert-manager/pages/AlertDetailPage.vue');

export const MONITORING_ROUTE = Object.freeze({
    _NAME: 'monitoring',
    ALERT_MANAGER: {
        _NAME: 'alertManager',
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
    redirect: '/monitoring/alert-manager/dashboard',
    meta: { label: 'Monitoring' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'alert-manager',
            meta: { label: 'Alert Manager' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: MONITORING_ROUTE.ALERT_MANAGER._NAME,
                    redirect: 'escalation-policy',
                    component: MonitoringMainPage,
                    children: [
                        {
                            path: 'dashboard',
                            name: MONITORING_ROUTE.ALERT_MANAGER.DASHBOARD._NAME,
                            component: AlertDashboardPage,
                        },
                        {
                            path: 'alert',
                            name: MONITORING_ROUTE.ALERT_MANAGER.ALERT._NAME,
                            component: AlertListPage,
                        },
                        {
                            path: 'escalation-policy',
                            name: MONITORING_ROUTE.ALERT_MANAGER.ESCALATION_POLICY._NAME,
                            component: EscalationPolicyPage,
                        },
                    ],
                },
                {
                    path: 'alert/:id',
                    name: MONITORING_ROUTE.ALERT_MANAGER.ALERT.DETAIL._NAME,
                    props: true,
                    component: AlertDetailPage,
                },
            ],
        },
    ],
} as RouteConfig;
