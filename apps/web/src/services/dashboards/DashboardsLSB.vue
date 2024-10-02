<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone } from 'lodash';

import {
    PIconButton,
} from '@cloudforet/mirinae';

import type { DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
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

import DashboardLSBTree from '@/services/dashboards/components/dashboard-main/DashboardLSBTree.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const appContextStore = useAppContextStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const dashboardGetters = dashboardStore.getters;

const { getProperRouteLocation } = useProperRouteLocation();

const router = useRouter();
const route = useRoute();

const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    favoriteItems: computed(() => favoriteGetters.dashboardItems),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
});
const state = reactive({
    loading: true,
    currentPath: computed(() => route.fullPath),
    privateV2DashboardItems: computed<PrivateDashboardModel[]>(() => dashboardState.privateDashboardItems
        .filter((d) => d.version !== '1.0')),
    publicV2DashboardItems: computed<PublicDashboardModel[]>(() => {
        const _filteredDashboardItems = dashboardState.publicDashboardItems.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _filteredDashboardItems;
        return _filteredDashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && d.project_id === '*'));
    }),
    publicV2DashboardMenuSet: computed(() => getDashboardMenuSet(state.publicV2DashboardItems)),
    privateV2DashboardMenuSet: computed(() => getDashboardMenuSet(state.privateV2DashboardItems)),
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
    favoriteItemMap: computed(() => {
        const result: Record<string, FavoriteConfig> = {};
        storeState.favoriteItems?.forEach((d) => {
            result[d.itemId] = d;
        });
        return result;
    }),
    starredMenuItems: computed<LSBMenu[]>(() => [
        ...(storeState.isWorkspaceOwner ? filterStarredItems(state.publicV2DashboardMenuSet) : []),
        ...filterStarredItems(state.privateV2DashboardMenuSet),
    ]),
    domainMenuSet: computed<LSBItem[]>(() => dashboardGetters.domainDashboardItems.map((d) => ({
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
    workspaceV1MenuSet: computed<LSBItem[]>(() => dashboardState.publicDashboardItems.filter((d) => d.version === '1.0').map((d) => ({
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
    privateV1MenuSet: computed<LSBMenu[]>(() => dashboardState.privateDashboardItems.filter((d) => d.version === '1.0').map((d) => ({
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
    adminMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.ADMIN'),
        id: 'admin',
    })),
    sharedMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARED'),
        id: 'shared',
    })),
    privateMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE'),
        id: 'private',
    })),
    deprecatedMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED'),
        id: 'deprecated',
    })),
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
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DASHBOARD'),
                subText: storeState.isAdminMode ? `(${state.domainMenuSet.length})` : undefined,
            },
        ];

        const menuSet: LSBMenu[] = [...defaultMenuSet];
        if (storeState.isAdminMode) {
            menuSet.push(state.adminMenu);
        } else {
            // favorite
            menuSet.unshift(
                {
                    type: MENU_ITEM_TYPE.STARRED,
                    childItems: state.starredMenuItems,
                    currentPath: state.currentPath,
                },
                { type: MENU_ITEM_TYPE.DIVIDER },
            );

            // shared, private
            menuSet.push(state.sharedMenu);
            menuSet.push(state.privateMenu);
        }

        if (state.deprecatedSubItem.length) {
            menuSet.push(state.deprecatedMenu);
        }
        return menuSet;
    }),
});

/* Util */
const getDashboardMenuSet = (dashboardList: DashboardModel[]) => dashboardList?.map((d) => ({
    type: MENU_ITEM_TYPE.ITEM,
    id: d.dashboard_id,
    label: d.name,
    to: getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: {
            dashboardId: d.dashboard_id,
        },
    }),
})) || [];
const filterStarredItems = (menuItems: LSBMenu[] = []): LSBMenu[] => {
    const result = [] as LSBMenu[];
    menuItems.forEach((d) => {
        if (Array.isArray(d)) {
            const filtered = d.filter((menu) => (menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id]) && menu.type === MENU_ITEM_TYPE.ITEM);
            if (filtered.length > 0) result.push(...filtered);
        } else if ((d.id && state.favoriteItemMap[d.favoriteOptions?.id || d.id]) && d.type === MENU_ITEM_TYPE.ITEM) result.push(d);
    });
    const _starredItem = result.map((d) => ({
        ...d,
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.id,
        },
    }));
    return _starredItem;
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
            <l-s-b-router-menu-item :current-path="state.currentPath"
                                    :item="item"
            >
                <template v-if="state.hasReadWriteAccess"
                          #right-extra
                >
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
        <template v-if="storeState.isAdminMode"
                  #slot-admin
        >
            <dashboard-l-s-b-tree type="PUBLIC"
                                  :dashboards="state.publicV2DashboardItems"
            />
        </template>
        <template v-if="storeState.isWorkspaceOwner"
                  #slot-shared
        >
            <l-s-b-collapsible-menu-item v-if="state.publicV2DashboardItems.length || dashboardGetters.workspaceFolderItems.length"
                                         class="category-menu-item mt-1"
                                         :item="{
                                             type: 'collapsible',
                                             label: $t('DASHBOARDS.LNB.SHARED'),
                                         }"
                                         is-sub-item
                                         show-sub-item-count
            >
                <template #collapsible-contents>
                    <dashboard-l-s-b-tree type="PUBLIC"
                                          :dashboards="state.publicV2DashboardItems"
                    />
                </template>
            </l-s-b-collapsible-menu-item>
        </template>
        <template #slot-private>
            <l-s-b-collapsible-menu-item v-if="state.privateV2DashboardItems.length || dashboardGetters.privateFolderItems.length"
                                         class="category-menu-item mt-1"
                                         :item="{
                                             type: 'collapsible',
                                             label: $t('DASHBOARDS.LNB.PRIVATE'),
                                         }"
                                         is-sub-item
                                         show-sub-item-count
            >
                <template #collapsible-contents>
                    <dashboard-l-s-b-tree type="PRIVATE"
                                          :dashboards="state.privateV2DashboardItems"
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
                                         show-sub-item-count
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
