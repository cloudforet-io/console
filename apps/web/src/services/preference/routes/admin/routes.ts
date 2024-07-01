import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

const PreferenceContainer = () => import('@/services/preference/PreferenceContainer.vue');
const DomainSettingsPage = () => import('@/services/preference/pages/admin/AdminDomainSettingsPage.vue');
const WorkspacesPage = () => import('@/services/preference/pages/admin/AdminWorkspacesPage.vue');
// const BookmarkPage = () => import('@/services/preference/pages/admin/AdminBookmarkPage.vue');

const adminPreferenceRoutes: RouteConfig = {
    path: 'preference',
    name: makeAdminRouteName(PREFERENCE_ROUTE._NAME),
    meta: {
        menuId: MENU_ID.PREFERENCE,
        translationId: MENU_INFO_MAP[MENU_ID.PREFERENCE].translationId,
    },
    redirect: () => ({
        name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME),
    }),
    component: PreferenceContainer,
    children: [
        {
            path: 'workspaces',
            name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME),
            meta: {
                menuId: MENU_ID.WORKSPACES,
                translationId: MENU_INFO_MAP[MENU_ID.WORKSPACES].translationId,
            },
            component: WorkspacesPage,
        },
        // TODO: will be updated next part
        // {
        //     path: 'bookmark',
        //     name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK._NAME),
        //     meta: {
        //         lsbVisible: true,
        //         menuId: MENU_ID.BOOKMARK,
        //         translationId: MENU_INFO_MAP[MENU_ID.BOOKMARK].translationId,
        //     },
        //     component: BookmarkPage,
        //     children: [
        //         {
        //             path: ':group?',
        //             name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK._NAME),
        //             meta: {
        //                 menuId: MENU_ID.BOOKMARK,
        //                 lsbVisible: true,
        //             },
        //             props: true,
        //             component: BookmarkPage,
        //         },
        //         {
        //             path: ':folder?',
        //             name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK._NAME),
        //             meta: {
        //                 menuId: MENU_ID.BOOKMARK,
        //                 lsbVisible: true,
        //             },
        //             props: true,
        //             component: BookmarkPage,
        //         },
        //     ],
        // },
        {
            path: 'domain-settings',
            name: makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS._NAME),
            meta: {
                menuId: MENU_ID.DOMAIN_SETTINGS,
                translationId: MENU_INFO_MAP[MENU_ID.DOMAIN_SETTINGS].translationId,
            },
            component: DomainSettingsPage,
        },
    ],
};
export default adminPreferenceRoutes;
