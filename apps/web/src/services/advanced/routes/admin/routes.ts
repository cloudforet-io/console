import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ADVANCED_ROUTE } from '@/services/advanced/routes/route-constant';

const AdvancedContainer = () => import('@/services/advanced/AdvancedContainer.vue');
const DomainSettingsContainer = () => import('@/services/advanced/components/PreferencesContainer.vue');
const AdminDomainSettingsBaseInformationPage = () => import('@/services/advanced/pages/admin/AdminDomainSettingsDomainInformationPage.vue');
const AdminDomainSettingsBrandAssetsPage = () => import('@/services/advanced/pages/admin/AdminDomainSettingsAppearancePage.vue');
const AdminDomainSettingsAutoDormancyConfigurationPage = () => import('@/services/advanced/pages/admin/AdminDomainSettingsAutoDormancyConfigurationPage.vue');
const WorkspacesPage = () => import('@/services/advanced/pages/admin/AdminWorkspacesPage.vue');
const AdminWorkspaceGroupPage = () => import('@/services/advanced/pages/admin/AdminWorkspaceGroupPage.vue');
const BookmarkContainer = () => import('@/services/advanced/components/BookmarkContainer.vue');
const BookmarkPage = () => import('@/services/advanced/pages/admin/AdminBookmarkPage.vue');
const BookmarkDetailContainer = () => import('@/services/advanced/components/BookmarkDetailContainer.vue');
const BookmarkDetailPage = () => import('@/services/advanced/pages/admin/AdminBookmarkDetailPage.vue');

const adminAdvancedRoutes: RouteConfig = {
    path: 'advanced',
    name: makeAdminRouteName(ADVANCED_ROUTE._NAME),
    meta: {
        menuId: MENU_ID.ADVANCED,
        translationId: MENU_INFO_MAP[MENU_ID.ADVANCED].translationId,
    },
    redirect: () => ({
        name: makeAdminRouteName(ADVANCED_ROUTE.WORKSPACES._NAME),
    }),
    component: AdvancedContainer,
    children: [
        {
            path: 'workspaces',
            name: makeAdminRouteName(ADVANCED_ROUTE.WORKSPACES._NAME),
            meta: {
                menuId: MENU_ID.WORKSPACES,
                translationId: MENU_INFO_MAP[MENU_ID.WORKSPACES].translationId,
            },
            component: WorkspacesPage,
        },
        {
            path: 'workspace-group',
            name: makeAdminRouteName(ADVANCED_ROUTE.WORKSPACE_GROUP._NAME),
            meta: {
                menuId: MENU_ID.WORKSPACE_GROUP,
                translationId: MENU_INFO_MAP[MENU_ID.WORKSPACE_GROUP].translationId,
            },
            component: AdminWorkspaceGroupPage,
        },
        {
            path: 'bookmark',
            name: makeAdminRouteName(ADVANCED_ROUTE.BOOKMARK._NAME),
            meta: {
                lsbVisible: true,
                menuId: MENU_ID.BOOKMARK,
                translationId: MENU_INFO_MAP[MENU_ID.BOOKMARK].translationId,
            },
            component: BookmarkContainer,
            children: [
                {
                    path: '/',
                    name: makeAdminRouteName(ADVANCED_ROUTE.BOOKMARK._NAME),
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
                            name: makeAdminRouteName(ADVANCED_ROUTE.BOOKMARK.DETAIL.GROUP._NAME),
                            meta: { lsbVisible: true },
                            props: true,
                            component: BookmarkDetailPage,
                            children: [
                                {
                                    path: ':folder?',
                                    name: makeAdminRouteName(ADVANCED_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME),
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
            path: 'preferences',
            name: makeAdminRouteName(ADVANCED_ROUTE.PREFERENCES._NAME),
            meta: {
                menuId: MENU_ID.PREFERENCES,
                lsbVisible: true,
                translationId: MENU_INFO_MAP[MENU_ID.PREFERENCES].translationId,
            },
            redirect: () => ({
                name: makeAdminRouteName(ADVANCED_ROUTE.PREFERENCES.DOMAIN_INFORMATION._NAME),
            }),
            component: DomainSettingsContainer,
            children: [
                {
                    path: '/domain-information',
                    name: makeAdminRouteName(ADVANCED_ROUTE.PREFERENCES.DOMAIN_INFORMATION._NAME),
                    meta: { lsbVisible: true, translationId: MENU_INFO_MAP[MENU_ID.DOMAIN_INFORMATION].translationId },
                    component: AdminDomainSettingsBaseInformationPage,
                },
                {
                    path: '/appearance',
                    name: makeAdminRouteName(ADVANCED_ROUTE.PREFERENCES.APPEARANCE._NAME),
                    meta: { lsbVisible: true, translationId: MENU_INFO_MAP[MENU_ID.APPEARANCE].translationId },
                    component: AdminDomainSettingsBrandAssetsPage,
                },
            ],
        },
        {
            path: 'auto-dormancy-configuration',
            name: makeAdminRouteName(ADVANCED_ROUTE.AUTO_DORMANCY_CONFIGURATION._NAME),
            meta: { menuId: MENU_ID.AUTO_DORMANCY_CONFIGURATION, translationId: MENU_INFO_MAP[MENU_ID.AUTO_DORMANCY_CONFIGURATION].translationId },
            component: AdminDomainSettingsAutoDormancyConfigurationPage,
        },
    ],
};
export default adminAdvancedRoutes;
