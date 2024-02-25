<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { FavoriteConfig } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE, FAVORITE_TYPE_TO_STATE_NAME } from '@/store/modules/favorite/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';

const route = useRoute();

const allReferenceStore = useAllReferenceStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;

const { getProperRouteLocation, isAdminMode } = useProperRouteLocation();

const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    projects: computed(() => allReferenceStore.getters.project),
});
const state = reactive({
    loading: true,
    currentPath: computed(() => route.fullPath),
    favoriteItemMap: computed(() => {
        const stateName = FAVORITE_TYPE_TO_STATE_NAME[FAVORITE_TYPE.DASHBOARD];
        const result: Record<string, FavoriteConfig> = {};
        if (stateName) {
            store.state.favorite[stateName]?.forEach((d) => {
                result[d.itemId] = d;
            });
        }
        return result;
    }),
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
    projectMenuSet: computed<LSBMenu[]>(() => mashUpProjectGroup(dashboardGetters.projectItems)),
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
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.private_dashboard_id,
        },
    }))),
    menuSet: computed<LSBMenu[]>(() => {
        const defaultMenuSet = [
            {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label: i18n.t('COMMON.STARRED'),
            },
            { type: MENU_ITEM_TYPE.DIVIDER },
        ];

        if (isAdminMode.value) {
            return [
                ...defaultMenuSet,
                ...state.domainMenuSet,
            ];
        }
        return [
            ...defaultMenuSet,
            ...(storeState.isWorkspaceOwner ? filterLSBItemsByPagePermission('WORKSPACE', filterMenuItems(state.workspaceMenuSet)) : []),
            ...filterLSBItemsByPagePermission('PROJECT', filterMenuItems(state.projectMenuSet)),
            ...filterLSBItemsByPagePermission('PRIVATE', filterMenuItems(state.privateMenuSet)),
        ];
    }),
    starredMenuSet: computed<LSBMenu[]>(() => [
        ...(storeState.isWorkspaceOwner ? filterStarredItems(state.workspaceMenuSet) : []),
        ...filterStarredItems(state.projectMenuSet),
        ...filterStarredItems(state.privateMenuSet),
    ]),
});

const filterLSBItemsByPagePermission = (scope: DashboardScope, items: LSBMenu[]): LSBMenu[] => {
    let label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE');
    if (scope === 'PROJECT') label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT');
    else if (scope === 'PRIVATE') label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
    const topTitle: LSBMenu = {
        type: MENU_ITEM_TYPE.TOP_TITLE,
        label,
    };
    if (scope === 'PRIVATE') {
        topTitle.icon = {
            name: 'ic_lock-filled',
            color: 'gray900',
        };
    }
    return [topTitle, ...items];
};

const mashUpProjectGroup = (dashboardList: PublicDashboardModel[] = []): LSBMenu[] => {
    const dashboardItemsWithGroup = {} as Record<string, PublicDashboardModel[]>;
    dashboardList.forEach((d) => {
        const projectGroupLabel: string = storeState.projects[d.project_id]?.label || d.project_id;
        if (dashboardItemsWithGroup[projectGroupLabel]) {
            dashboardItemsWithGroup[projectGroupLabel].push(d);
        } else {
            dashboardItemsWithGroup[projectGroupLabel] = [d];
        }
    });

    // Result to return
    const result = [] as LSBMenu[];

    // The mapped group items are in the form of an array along with the title, and each item is mapped to LNBItem type and pushed to result.
    Object.keys(dashboardItemsWithGroup).forEach((d) => {
        result.push([
            {
                type: MENU_ITEM_TYPE.TITLE,
                label: d,
                id: d,
                foldable: true,
            },
            ...dashboardItemsWithGroup[d].map((board) => ({
                type: MENU_ITEM_TYPE.ITEM,
                id: board.public_dashboard_id,
                label: board.name,
                to: getProperRouteLocation({
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    params: {
                        dashboardId: board.public_dashboard_id,
                    },
                }),
                favoriteOptions: {
                    type: FAVORITE_TYPE.DASHBOARD,
                    id: board.public_dashboard_id,
                },
            })),
        ]);
    });

    // Return LNBMenu type as (LNBItem | LNBItem[])[]
    return result;
};

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


(async () => {
    await dashboardStore.load();
})();
</script>

<template>
    <l-s-b class="dashboards-l-s-b"
           :menu-set="state.menuSet"
    >
        <template #collapsible-contents>
            <div v-if="state.starredMenuSet.length > 0">
                <l-s-b-router-menu-item v-for="(item, idx) of state.starredMenuSet"
                                        :key="idx"
                                        :item="item"
                                        :idx="idx"
                                        :current-path="state.currentPath"
                                        is-hide-favorite
                />
            </div>
            <span v-else
                  class="no-data"
            >
                {{ $t('COMMON.STARRED_NO_DATA') }}
            </span>
        </template>
    </l-s-b>
</template>

<style scoped lang="postcss">
.dashboards-l-s-b {
    .no-data {
        @apply text-gray-500;
    }
}
</style>
