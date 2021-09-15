import { RouteConfig } from 'vue-router';

const AlertManagerPage = () => import(/* webpackChunkName: "AlertManagerPage" */ '@/services/monitoring/alert-manager/AlertManagerPage.vue');

const AlertDashboardPage = () => import(/* webpackChunkName: "AlertDashboardPage" */ '@/services/monitoring/alert-manager/alert-dashboard/AlertDashboardPage.vue');
const AlertPage = () => import(/* webpackChunkName: "AlertPage" */ '@/services/monitoring/alert-manager/alert/AlertPage.vue');
const EscalationPolicyPage = () => import(/* webpackChunkName: "EscalationPolicyPage" */ '@/services/monitoring/alert-manager/escalation-policy/EscalationPolicyPage.vue');
const AlertDetailPage = () => import(/* webpackChunkName: "AlertDetailPage" */ '@/services/monitoring/alert-manager/alert/alert-detail/AlertDetailPage.vue');

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
                    redirect: 'dashboard',
                    component: AlertManagerPage,
                    children: [
                        {
                            path: 'dashboard',
                            name: MONITORING_ROUTE.ALERT_MANAGER.DASHBOARD._NAME,
                            component: AlertDashboardPage,
                        },
                        {
                            path: 'alert',
                            name: MONITORING_ROUTE.ALERT_MANAGER.ALERT._NAME,
                            component: AlertPage,
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
