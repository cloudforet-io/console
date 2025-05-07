<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PIconButton,
} from '@cloudforet/mirinae';

import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { MENU_ID } from '@/lib/menu/config';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
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
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const appContextStore = useAppContextStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const authorizationStore = useAuthorizationStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();
const route = useRoute();

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
} = useDashboardFolderQuery();

const storeState = reactive({
    isWorkspaceOwner: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    favoriteItems: computed(() => favoriteGetters.dashboardItems),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

const queryState = reactive({
    publicDashboardItems: computed(() => {
        const _v2DashboardItems = publicDashboardList.value?.filter((d) => d.version !== '1.0') || [];
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed(() => privateDashboardList.value?.filter((d) => d.version !== '1.0') || []),
    publicFolderItems: computed(() => {
        if (storeState.isAdminMode) return publicFolderList.value;
        return publicFolderList.value?.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT')) || [];
    }),
    privateFolderItems: computed(() => privateFolderList.value),
});

const state = reactive({
    currentPath: computed(() => route.fullPath),
    publicV2DashboardMenuSet: computed(() => getDashboardMenuSet(queryState.publicDashboardItems)),
    privateV2DashboardMenuSet: computed(() => getDashboardMenuSet(queryState.privateDashboardItems)),
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
    deprecatedDashboardItems: computed(() => {
        const _public = publicDashboardList.value?.filter((d) => d.version === '1.0') || [];
        const _private = privateDashboardList.value?.filter((d) => d.version === '1.0') || [];
        return [..._public, ..._private];
    }),
    deprecatedMenuSet: computed<LSBItem[]>(() => state.deprecatedDashboardItems.map((d) => {
        const dashboardDetailRouteName = storeState.isAdminMode
            ? ADMIN_DASHBOARDS_ROUTE.DETAIL._NAME
            : DASHBOARDS_ROUTE.DETAIL._NAME;
        return {
            type: MENU_ITEM_TYPE.ITEM,
            id: d.dashboard_id,
            label: d.name,
            to: {
                name: dashboardDetailRouteName,
                params: {
                    dashboardId: d.dashboard_id,
                },
            },
            icon: d.dashboard_id.startsWith('private') ? {
                name: 'ic_lock-filled',
                color: gray[500],
            } : undefined,
            favoriteOptions: {
                type: FAVORITE_TYPE.DASHBOARD,
                id: d.dashboard_id,
            },
        };
    })),
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
    menuSet: computed<LSBMenu[]>(() => {
        const defaultMenuSet: LSBMenu[] = [
            {
                // type: MENU_ITEM_TYPE.ITEM,
                type: MENU_ITEM_TYPE.SLOT,
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL'),
                id: MENU_ID.DASHBOARDS,
                to: { name: storeState.isAdminMode ? ADMIN_DASHBOARDS_ROUTE._NAME : DASHBOARDS_ROUTE._NAME },
                hideFavorite: true,
                icon: 'ic_dots-4-square',
            },
            { type: MENU_ITEM_TYPE.DIVIDER },
            {
                type: MENU_ITEM_TYPE.TOP_TITLE,
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DASHBOARD'),
                subText: storeState.isAdminMode ? `(${state.publicV2DashboardMenuSet.length})` : undefined,
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

        if (state.deprecatedMenuSet.length) {
            menuSet.push(state.deprecatedMenu);
        }
        return menuSet;
    }),
});





/* Util */
const getDashboardMenuSet = (dashboardList: (PublicDashboardModel|PrivateDashboardModel)[]) => dashboardList?.map((d) => {
    const dashboardDetailRouteName = storeState.isAdminMode
        ? ADMIN_DASHBOARDS_ROUTE.DETAIL._NAME
        : DASHBOARDS_ROUTE.DETAIL._NAME;
    return {
        type: MENU_ITEM_TYPE.ITEM,
        id: d.dashboard_id,
        label: d.name,
        to: {
            name: dashboardDetailRouteName,
            params: {
                dashboardId: d.dashboard_id,
            },
        },
    };
}) || [];
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
// const loadDashboard = async () => {
//     await dashboardStore.load();
// };

/* Event */
const handleClickAddButton = () => {
    const dashboardCreateRouteName = storeState.isAdminMode
        ? ADMIN_DASHBOARDS_ROUTE.CREATE._NAME
        : DASHBOARDS_ROUTE.CREATE._NAME;
    router.push({ name: dashboardCreateRouteName }).catch(() => {});
};

</script>

<template>
    <l-s-b class="dashboards-l-s-b"
           :menu-set="state.menuSet"
    >
        <template #slot-dashboards="item">
            <l-s-b-router-menu-item :current-path="state.currentPath"
                                    :item="item"
            >
                <template v-if="hasReadWriteAccess"
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
                                  :dashboards="queryState.publicDashboardItems"
                                  :folders="queryState.publicFolderItems"
            />
        </template>
        <template v-if="!storeState.isAdminMode"
                  #slot-shared
        >
            <l-s-b-collapsible-menu-item v-if="queryState.publicFolderItems.length || queryState.publicDashboardItems.length"
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
                                          :dashboards="queryState.publicDashboardItems"
                                          :folders="queryState.publicFolderItems"
                    />
                </template>
            </l-s-b-collapsible-menu-item>
        </template>
        <template #slot-private>
            <l-s-b-collapsible-menu-item v-if="queryState.privateFolderItems.length || queryState.privateDashboardItems.length"
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
                                          :dashboards="queryState.privateDashboardItems"
                                          :folders="queryState.privateFolderItems"
                    />
                </template>
            </l-s-b-collapsible-menu-item>
        </template>
        <template #slot-deprecated>
            <l-s-b-collapsible-menu-item v-if="state.deprecatedMenuSet.length"
                                         class="category-menu-item mt-1"
                                         :item="{
                                             type: 'collapsible',
                                             label: $t('DASHBOARDS.LNB.DEPRECATED'),
                                             subItems: state.deprecatedMenuSet,
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
