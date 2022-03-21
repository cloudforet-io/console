import { RouteConfig } from 'vue-router';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';

const AlertManagerPage = () => import(/* webpackChunkName: "AlertManagerPage" */ '@/services/alert-manager/AlertManagerPage.vue');
const AlertDashboardPage = () => import(/* webpackChunkName: "AlertDashboardPage" */ '@/services/alert-manager/alert-dashboard/AlertDashboardPage.vue');
const AlertPage = () => import(/* webpackChunkName: "AlertPage" */ '@/services/alert-manager/alert/AlertPage.vue');
const EscalationPolicyPage = () => import(/* webpackChunkName: "EscalationPolicyPage" */ '@/services/alert-manager/escalation-policy/EscalationPolicyPage.vue');
const AlertDetailPage = () => import(/* webpackChunkName: "AlertDetailPage" */ '@/services/alert-manager/alert/alert-detail/AlertDetailPage.vue');

export default {
    path: 'alert-manager',
    name: ALERT_MANAGER_ROUTE._NAME,
    redirect: '/alert-manager/dashboard',
    meta: { label: 'Alert Manager' },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: ALERT_MANAGER_ROUTE._NAME,
            redirect: 'dashboard',
            component: AlertManagerPage,
            children: [
                {
                    path: 'dashboard',
                    name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
                    meta: { isVerticalLayout: true },
                    component: AlertDashboardPage,
                },
                {
                    path: 'alert',
                    name: ALERT_MANAGER_ROUTE.ALERT._NAME,
                    meta: { isVerticalLayout: true },
                    component: AlertPage,
                },
                {
                    path: 'alert/:id?',
                    name: ALERT_MANAGER_ROUTE.ALERT.DETAIL._NAME,
                    props: true,
                    component: AlertDetailPage,
                },
                {
                    path: 'escalation-policy',
                    name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
                    meta: { isVerticalLayout: true },
                    component: EscalationPolicyPage,
                },
            ],
        },
    ],
} as RouteConfig;
