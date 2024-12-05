import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';

const AlertManagerContainer = () => import('@/services/alert-manager-v2/AlertManagerContainer.vue');
const ServiceMainPage = () => import('@/services/alert-manager-v2/pages/ServiceMainPage.vue');
const ServiceDetailPage = () => import('@/services/alert-manager-v2/pages/ServiceDetailPage.vue');
const ServiceCreatePage = () => import('@/services/alert-manager-v2/pages/ServiceCreatePage.vue');
const ServiceDetailWebhookCreatePage = () => import('@/services/alert-manager-v2/pages/ServiceDetailWebhookCreatePage.vue');
const ServiceDetailNotificationsCreatePage = () => import('@/services/alert-manager-v2/pages/ServiceDetailNotificationsCreatePage.vue');

const alertManagerV2Routes: RouteConfig = {
    path: 'alert-manager-v2',
    name: ALERT_MANAGER_V2_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.ALERT_MANAGER_V2,
        translationId: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_V2].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
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
                    name: ALERT_MANAGER_V2_ROUTE.SERVICE._NAME,
                    meta: { menuId: MENU_ID.SERVICE },
                    component: ServiceMainPage as any,
                },
                {
                    path: 'create',
                    name: ALERT_MANAGER_V2_ROUTE.SERVICE.CREATE._NAME,
                    meta: { centeredLayout: true },
                    component: ServiceCreatePage as any,
                },
                {
                    path: ':serviceId',
                    name: ALERT_MANAGER_V2_ROUTE.SERVICE.DETAIL._NAME,
                    props: true,
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: ALERT_MANAGER_V2_ROUTE.SERVICE.DETAIL._NAME,
                            props: true,
                            component: ServiceDetailPage as any,
                        },
                        {
                            path: 'webhook/create',
                            name: ALERT_MANAGER_V2_ROUTE.SERVICE.DETAIL.WEBHOOK.CREATE._NAME,
                            meta: { centeredLayout: true },
                            component: ServiceDetailWebhookCreatePage as any,
                        },
                        {
                            path: 'notifications/create',
                            name: ALERT_MANAGER_V2_ROUTE.SERVICE.DETAIL.NOTIFICATIONS.CREATE._NAME,
                            meta: { centeredLayout: true },
                            component: ServiceDetailNotificationsCreatePage as any,
                        },
                    ],
                },
            ],
        },
    ],

};
export default alertManagerV2Routes;
