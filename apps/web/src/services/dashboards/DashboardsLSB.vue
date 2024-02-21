<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PIconButton } from '@spaceone/design-system';

import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { FavoriteConfig } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE, FAVORITE_TYPE_TO_STATE_NAME } from '@/store/modules/favorite/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';

const router = useRouter();
const allReferenceStore = useAllReferenceStore();
const { getProperRouteLocation, isAdminMode } = useProperRouteLocation();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    projects: computed(() => allReferenceStore.getters.project),
});
const state = reactive({
    loading: true,
    showFavoriteOnly: false,
    header: computed(() => i18n.t(MENU_INFO_MAP[MENU_ID.DASHBOARDS].translationId)),
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
        type: 'item',
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
        type: 'item',
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
        type: 'item',
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
                type: 'item',
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL'),
                id: MENU_ID.DASHBOARDS,
                foldable: false,
                to: getProperRouteLocation({
                    name: DASHBOARDS_ROUTE.ALL._NAME,
                }),
                hideFavorite: true,
            },
            { type: 'divider' },
            { type: 'favorite-only' },
        ];

        if (isAdminMode.value) {
            return [
                ...defaultMenuSet,
                ...state.domainMenuSet,
            ];
        }
        return [
            ...defaultMenuSet,
            ...(storeState.isWorkspaceOwner ? filterLSBItemsByPagePermission('WORKSPACE', filterFavoriteItems(state.workspaceMenuSet)) : []),
            ...filterLSBItemsByPagePermission('PROJECT', filterFavoriteItems(state.projectMenuSet)),
            ...filterLSBItemsByPagePermission('PRIVATE', filterFavoriteItems(state.privateMenuSet)),
        ];
    }),
});

const filterLSBItemsByPagePermission = (scope: DashboardScope, items: LSBMenu[]): LSBMenu[] => {
    let label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE');
    if (scope === 'PROJECT') label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT');
    else if (scope === 'PRIVATE') label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
    const topTitle: LSBMenu = {
        type: 'top-title',
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

const filterFavoriteItems = (menuItems: LSBMenu[] = []): LSBMenu[] => {
    if (!state.showFavoriteOnly) return menuItems;
    const result = [] as LSBMenu[];
    menuItems.forEach((d) => {
        if (Array.isArray(d)) {
            const filtered = d.filter((menu) => (menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id]) || menu.type !== MENU_ITEM_TYPE.ITEM);
            const hasProject = filtered.filter((f) => f.type === 'item').length > 0;
            if (hasProject) result.push(filtered);
        } else if ((d.id && state.favoriteItemMap[d.favoriteOptions?.id || d.id]) || d.type !== MENU_ITEM_TYPE.ITEM) result.push(d);
    });
    return result;
};

const handleClickCreateDashboard = () => {
    router.push(getProperRouteLocation({ name: DASHBOARDS_ROUTE.CREATE._NAME }));
};


(async () => {
    await dashboardStore.load();
})();
</script>

<template>
    <l-s-b class="dashboards-l-s-b"
           :class="{'admin-mode': isAdminMode}"
           :menu-set="state.menuSet"
           :show-favorite-only.sync="state.showFavoriteOnly"
    >
        <template #header>
            <div class="header-wrapper">
                <span>{{ state.header }}</span>
                <p-icon-button name="ic_plus_bold"
                               size="sm"
                               @click="handleClickCreateDashboard"
                />
            </div>
        </template>
    </l-s-b>
</template>

<style lang="postcss" scoped>
.dashboards-l-s-b {
    .header-wrapper {
        @apply flex justify-between items-center font-bold;
        padding-right: 1.25rem;
    }

    /* custom lsb */
    &.admin-mode {
        :deep(.favorite-only-wrapper) {
            padding-bottom: 0.5rem;
        }
    }
}
</style>
