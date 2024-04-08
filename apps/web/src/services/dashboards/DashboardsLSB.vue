<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { MENU_ID } from '@/lib/menu/config';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteConfig } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { gray } from '@/styles/colors';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const route = useRoute();

const allReferenceStore = useAllReferenceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;

const { getProperRouteLocation, isAdminMode } = useProperRouteLocation();

const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    projects: computed(() => allReferenceStore.getters.project),
    favoriteItems: computed(() => favoriteGetters.dashboardItems),
});
const state = reactive({
    loading: true,
    currentPath: computed(() => route.fullPath),
    favoriteItemMap: computed(() => {
        const result: Record<string, FavoriteConfig> = {};
        storeState.favoriteItems?.forEach((d) => {
            result[d.itemId] = d;
        });
        return result;
    }),
    starredMenuItems: computed<LSBMenu[]>(() => [
        ...(storeState.isWorkspaceOwner ? filterStarredItems(state.workspaceMenuSet) : []),
        ...filterStarredItems(state.projectMenuSet),
        ...filterStarredItems(state.privateMenuSet),
    ]),
    domainMenuSet: computed<LSBItem[]>(() => dashboardGetters.domainItems.map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.public_dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.public_dashboard_id,
            },
        }),
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.public_dashboard_id,
        },
    }))),
    workspaceMenuSet: computed<LSBItem[]>(() => dashboardGetters.workspaceItems.map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.public_dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.public_dashboard_id,
            },
        }),
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.public_dashboard_id,
        },
    }))),
    projectMenuSet: computed<LSBMenu[]>(() => dashboardGetters.projectItems.map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.public_dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.public_dashboard_id,
            },
        }),
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.public_dashboard_id,
        },
    }))),
    privateMenuSet: computed<LSBMenu[]>(() => dashboardGetters.privateItems.map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.private_dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.private_dashboard_id,
            },
        }),
        icon: {
            name: 'ic_lock-filled',
            color: gray[500],
        },
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.private_dashboard_id,
        },
    }))),
    menuSet: computed<LSBMenu[]>(() => {
        const defaultMenuSet: LSBMenu[] = [
            {
                type: MENU_ITEM_TYPE.ITEM,
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL'),
                id: MENU_ID.DASHBOARDS,
                foldable: false,
                to: getProperRouteLocation({
                    name: DASHBOARDS_ROUTE._NAME,
                }),
                hideFavorite: true,
                icon: 'ic_dots-4-square',
            },
            { type: MENU_ITEM_TYPE.DIVIDER },
            {
                type: MENU_ITEM_TYPE.TOP_TITLE,
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE'),
            },
        ];

        if (isAdminMode.value) {
            return [
                ...defaultMenuSet,
                ...state.domainMenuSet,
            ];
        }

        defaultMenuSet.unshift(
            {
                type: MENU_ITEM_TYPE.STARRED,
                childItems: state.starredMenuItems,
                currentPath: state.currentPath,
            },
            { type: MENU_ITEM_TYPE.DIVIDER },
        );

        return [
            ...defaultMenuSet,
            ...(storeState.isWorkspaceOwner ? filterMenuItems(state.workspaceMenuSet) : []),
            ...filterMenuItems(state.projectMenuSet),
            ...filterMenuItems(state.privateMenuSet),
        ];
    }),
});

const filterStarredItems = (menuItems: LSBMenu[] = []): LSBMenu[] => {
    const result = [] as LSBMenu[];
    menuItems.forEach((d) => {
        if (Array.isArray(d)) {
            const filtered = d.filter((menu) => (menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id]) && menu.type === MENU_ITEM_TYPE.ITEM);
            if (filtered.length > 0) result.push(...filtered);
        } else if ((d.id && state.favoriteItemMap[d.favoriteOptions?.id || d.id]) && d.type === MENU_ITEM_TYPE.ITEM) result.push(d);
    });
    return result;
};
const filterMenuItems = (menuItems: LSBMenu[] = []): LSBMenu[] => {
    const result = [] as LSBMenu[];
    menuItems.forEach((d) => {
        if (Array.isArray(d)) {
            const filtered = d.filter((menu) => !(menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id]) || menu.type !== MENU_ITEM_TYPE.ITEM);
            const hasProject = filtered.filter((f) => f.type === 'item').length > 0;
            if (hasProject) result.push(filtered);
        } else if (!(d.id && state.favoriteItemMap[d.favoriteOptions?.id || d.id]) || d.type !== MENU_ITEM_TYPE.ITEM) {
            result.push(d);
        }
    });
    return result;
};
const loadDashboard = async () => {
    await dashboardStore.load();
};
const { callApiWithGrantGuard } = useGrantScopeGuard(['WORKSPACE'], loadDashboard);
callApiWithGrantGuard();
</script>

<template>
    <l-s-b class="dashboards-l-s-b"
           :menu-set="state.menuSet"
    />
</template>
