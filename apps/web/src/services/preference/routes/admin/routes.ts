import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

const PreferenceContainer = () => import('@/services/preference/PreferenceContainer.vue');
const DomainSettingsPage = () => import('@/services/preference/pages/admin/AdminDomainSettingsPage.vue');
const WorkspacesPage = () => import('@/services/preference/pages/admin/AdminWorkspacesPage.vue');
const BookmarkContainer = () => import('@/services/preference/components/BookmarkContainer.vue');
const BookmarkPage = () => import('@/services/preference/pages/admin/AdminBookmarkPage.vue');
const BookmarkDetailContainer = () => import('@/services/preference/components/BookmarkDetailContainer.vue');
const BookmarkDetailPage = () => import('@/services/preference/pages/admin/AdminBookmarkDetailPage.vue');

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
        {
            path: 'bookmark',
            name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK._NAME),
            meta: {
                lsbVisible: true,
                menuId: MENU_ID.BOOKMARK,
                translationId: MENU_INFO_MAP[MENU_ID.BOOKMARK].translationId,
            },
            component: BookmarkContainer,
            children: [
                {
                    path: '/',
                    name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK._NAME),
                    meta: { lsbVisible: true, menuId: MENU_ID.BOOKMARK },
                    props: true,
                    component: BookmarkPage,
                },
                {
                    path: 'detail',
                    props: true,
                    component: BookmarkDetailContainer,
                    children: [
                        {
                            path: ':group?',
                            name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL.GROUP._NAME),
                            meta: { lsbVisible: true },
                            props: true,
                            component: BookmarkDetailPage,
                            children: [
                                {
                                    path: ':folder?',
                                    name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME),
                                    meta: { lsbVisible: true },
                                    props: true,
                                    component: BookmarkDetailPage,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
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
