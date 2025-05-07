import type { RouteConfig } from 'vue-router';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';

const AlertManagerContainer = () => import('@/services/alert-manager/v2/AlertManagerContainer.vue');
const ServiceMainPage = () => import('@/services/alert-manager/v2/pages/ServiceMainPage.vue');
const ServiceDetailPage = () => import('@/services/alert-manager/v2/pages/ServiceDetailPage.vue');
const ServiceCreatePage = () => import('@/services/alert-manager/v2/pages/ServiceCreatePage.vue');
const ServiceDetailWebhookCreatePage = () => import('@/services/alert-manager/v2/pages/ServiceDetailWebhookCreatePage.vue');
const ServiceDetailNotificationsCreatePage = () => import('@/services/alert-manager/v2/pages/ServiceDetailNotificationsCreatePage.vue');
const AlertContainer = () => import('@/services/alert-manager/v2/AlertContainer.vue');
const AlertsMainPage = () => import('@/services/alert-manager/v2/pages/AlertsMainPage.vue');
const AlertsDetailPage = () => import('@/services/alert-manager/v2/pages/AlertsDetailPage.vue');

const alertManagerRoute: RouteConfig = {
    path: 'alert-manager',
    name: ALERT_MANAGER_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.ALERT_MANAGER,
        translationId: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to),
    component: AlertManagerContainer,
    children: [
        {
            path: 'service',
            meta: {
                menuId: MENU_ID.SERVICE,
                translationId: MENU_INFO_MAP[MENU_ID.SERVICE].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: ALERT_MANAGER_ROUTE.SERVICE._NAME,
                    meta: { menuId: MENU_ID.SERVICE },
                    component: ServiceMainPage as any,
                },
                {
                    path: 'create',
                    name: ALERT_MANAGER_ROUTE.SERVICE.CREATE._NAME,
                    meta: { centeredLayout: true },
                    component: ServiceCreatePage as any,
                },
                {
                    path: ':serviceId',
                    props: true,
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                            props: true,
                            meta: { label: ({ params }) => params.serviceId, copiable: true },
                            component: ServiceDetailPage as any,
                        },
                        {
                            path: 'webhook/create',
                            name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL.WEBHOOK.CREATE._NAME,
                            props: true,
                            meta: { centeredLayout: true },
                            component: ServiceDetailWebhookCreatePage as any,
                        },
                        {
                            path: 'notifications/create',
                            name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL.NOTIFICATIONS.CREATE._NAME,
                            props: true,
                            meta: { centeredLayout: true },
                            component: ServiceDetailNotificationsCreatePage as any,
                        },
                    ],
                },
            ],
        },
        {
            path: 'alerts',
            meta: {
                menuId: MENU_ID.ALERTS,
                translationId: MENU_INFO_MAP[MENU_ID.ALERTS].translationId,
            },
            component: AlertContainer as any,
            children: [
                {
                    path: '/',
                    name: ALERT_MANAGER_ROUTE.ALERTS._NAME,
                    meta: { menuId: MENU_ID.ALERTS },
                    component: AlertsMainPage as any,
                },
                {
                    path: ':alertId',
                    name: ALERT_MANAGER_ROUTE.ALERTS.DETAIL._NAME,
                    props: true,
                    meta: { label: ({ params }) => params.alertId, copiable: true },
                    component: AlertsDetailPage as any,
                },
            ],
        },
    ],

};
export default alertManagerRoute;
