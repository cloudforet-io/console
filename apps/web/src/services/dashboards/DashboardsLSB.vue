<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PIconButton,
} from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { MENU_ID } from '@/lib/menu/config';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteConfig } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBCollapsibleMenuItem from '@/common/modules/navigations/lsb/modules/LSBCollapsibleMenuItem.vue';
import LSBMenuItem from '@/common/modules/navigations/lsb/modules/LSBMenuItem.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { gray } from '@/styles/colors';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const route = useRoute();

const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;

const { getProperRouteLocation, isAdminMode } = useProperRouteLocation();


const router = useRouter();
const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
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
        ...(storeState.isWorkspaceOwner ? filterStarredItems(state.workspaceV2MenuSet) : []),
        ...filterStarredItems(state.privateV2MenuSet),
    ]),
    domainMenuSet: computed<LSBItem[]>(() => dashboardGetters.domainItems.map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.dashboard_id,
            },
        }),
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.dashboard_id,
        },
    }))),
    workspaceV2MenuSet: computed<LSBItem[]>(() => dashboardGetters.workspaceItems.filter((d) => d.version === '2.0').map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.dashboard_id,
            },
        }),
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.dashboard_id,
        },
    }))),
    workspaceV1MenuSet: computed<LSBItem[]>(() => dashboardGetters.workspaceItems.filter((d) => d.version === '1.0').map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.dashboard_id,
            },
        }),
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.dashboard_id,
        },
    }))),
    privateV2MenuSet: computed<LSBMenu[]>(() => dashboardGetters.privateItems.filter((d) => d.version === '2.0').map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.dashboard_id,
            },
        }),
        icon: {
            name: 'ic_lock-filled',
            color: gray[500],
        },
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.dashboard_id,
        },
    }))),
    privateV1MenuSet: computed<LSBMenu[]>(() => dashboardGetters.privateItems.filter((d) => d.version === '1.0').map((d) => ({
        type: MENU_ITEM_TYPE.ITEM,
        id: d.dashboard_id,
        label: d.name,
        to: getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.dashboard_id,
            },
        }),
        icon: {
            name: 'ic_lock-filled',
            color: gray[500],
        },
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.dashboard_id,
        },
    }))),
    sharedMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('COMMON.SHARED'),
        id: 'shared',
    })),
    privateMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('COMMON.PRIVATE'),
        id: 'private',
    })),
    deprecatedMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('COMMON.DEPRECATED'),
        id: 'deprecated',
    })),
    sharedSubItem: computed<LSBMenu[]>(() => (storeState.isWorkspaceOwner ? filterMenuItems(state.workspaceV2MenuSet) : [])),
    privateSubItem: computed<LSBMenu[]>(() => filterMenuItems(state.privateV2MenuSet)),
    deprecatedSubItem: computed<LSBMenu[]>(() => [
        ...state.workspaceV1MenuSet,
        ...state.privateV1MenuSet,
    ]),
    menuSet: computed<LSBMenu[]>(() => {
        const defaultMenuSet: LSBMenu[] = [
            {
                // type: MENU_ITEM_TYPE.ITEM,
                type: MENU_ITEM_TYPE.SLOT,
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL'),
                id: MENU_ID.DASHBOARDS,
                to: getProperRouteLocation({ name: DASHBOARDS_ROUTE._NAME }),
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

        const menuSet: LSBMenu[] = [
            ...defaultMenuSet,
            state.sharedMenu,
            state.privateMenu,
        ];
        if (state.deprecatedSubItem.length) {
            menuSet.push(state.deprecatedMenu);
        }
        return menuSet;
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
        if (!Array.isArray(d)) {
            result.push(d);
        }
    });
    return result;
};
const loadDashboard = async () => {
    await dashboardStore.load();
};

/* Event */
const handleClickAddButton = () => {
    router.push(getProperRouteLocation({ name: DASHBOARDS_ROUTE.CREATE._NAME }));
};

const { callApiWithGrantGuard } = useGrantScopeGuard(['WORKSPACE'], loadDashboard);
callApiWithGrantGuard();
</script>

<template>
    <l-s-b class="dashboards-l-s-b"
           :menu-set="state.menuSet"
    >
        <template #slot-dashboards="item">
            <l-s-b-router-menu-item :item="item">
                <template #right-extra>
                    <p-icon-button name="ic_plus"
                                   size="sm"
                                   style-type="tertiary"
                                   shape="square"
                                   class="dashboard-create-button"
                                   @click.prevent="handleClickAddButton"
                    />
                </template>
            </l-s-b-router-menu-item>
        </template>
        <template v-if="storeState.isWorkspaceOwner"
                  #slot-shared
        >
            <l-s-b-collapsible-menu-item v-if="state.sharedSubItem.length"
                                         class="category-menu-item mt-1"
                                         :item="{
                                             type: 'collapsible',
                                             label: $t('DASHBOARDS.LNB.SHARED'),
                                             subItems: state.sharedSubItem,
                                         }"
                                         is-sub-item
            >
                <template #collapsible-contents="{ item: _item }">
                    <l-s-b-menu-item v-for="item in _item?.subItems"
                                     :key="item.id"
                                     :menu-data="item"
                                     :current-path="state.currentPath"
                    />
                </template>
            </l-s-b-collapsible-menu-item>
        </template>
        <template #slot-private>
            <l-s-b-collapsible-menu-item v-if="state.privateSubItem.length"
                                         class="category-menu-item mt-1"
                                         :item="{
                                             type: 'collapsible',
                                             label: $t('DASHBOARDS.LNB.PRIVATE'),
                                             subItems: state.privateSubItem,
                                         }"
                                         is-sub-item
            >
                <template #collapsible-contents="{ item: _item }">
                    <l-s-b-menu-item v-for="item in _item?.subItems"
                                     :key="item.id"
                                     :menu-data="item"
                                     :current-path="state.currentPath"
                    />
                </template>
            </l-s-b-collapsible-menu-item>
        </template>
        <template #slot-deprecated>
            <l-s-b-collapsible-menu-item v-if="state.deprecatedSubItem.length"
                                         class="category-menu-item mt-1"
                                         :item="{
                                             type: 'collapsible',
                                             label: $t('DASHBOARDS.LNB.DEPRECATED'),
                                             subItems: state.deprecatedSubItem,
                                         }"
                                         is-sub-item
                                         :override-collapsed="true"
            >
                <template #collapsible-contents="{ item: _item }">
                    <l-s-b-menu-item v-for="item in _item?.subItems"
                                     :key="item.id"
                                     :menu-data="item"
                                     :current-path="state.currentPath"
                    />
                </template>
            </l-s-b-collapsible-menu-item>
        </template>
    </l-s-b>
</template>
