import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';

const ServiceMainPage = () => import('@/services/alert-manager-v2/pages/ServiceMainPage.vue');

const alertManagerV2Routes: RouteConfig = {
    path: 'alert-manager-v2',
    name: ALERT_MANAGER_V2_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.ALERT_MANAGER_V2,
        translationId: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_V2].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
    component: { template: '<router-view />' },
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
            ],
        },
    ],

};
export default alertManagerV2Routes;
