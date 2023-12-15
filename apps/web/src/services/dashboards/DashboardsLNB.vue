<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PIconButton } from '@spaceone/design-system';

import type { DashboardScope } from '@/schema/dashboard/_types/dashboard-type';
import type { DashboardModel } from '@/schema/dashboard/dashboard/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { FavoriteConfig } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE, FAVORITE_TYPE_TO_STATE_NAME } from '@/store/modules/favorite/type';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


const PRIVATE_ICON = 'ic_lock-filled';
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const storeState = reactive({
    projects: computed(() => store.getters['reference/projectItems']),
});
const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
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
    workspaceMenuSet: computed<LNBItem[]>(() => dashboardGetters.workspaceItems.map((d) => ({
        type: 'item',
        id: d.dashboard_id,
        label: d.name,
        to: {
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.dashboard_id,
            },
        },
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.dashboard_id,
        },
        icon: d.dashboard_type === 'PRIVATE' ? PRIVATE_ICON : undefined,
    }))),
    projectDashboardList: computed<DashboardModel[]>(() => dashboardGetters.projectItems),
    projectMenuSet: computed<LNBMenu[]>(() => mashUpProjectGroup(state.projectDashboardList)),
    menuSet: computed<LNBMenu[]>(() => [
        {
            type: 'item',
            label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL'),
            id: MENU_ID.DASHBOARDS,
            foldable: false,
            to: {
                name: DASHBOARDS_ROUTE.ALL._NAME,
            },
            hideFavorite: true,
        },
        { type: 'divider' },
        { type: 'favorite-only' },
        ...filterLNBItemsByPagePermission('WORKSPACE', filterFavoriteItems(state.workspaceMenuSet)),
        ...filterLNBItemsByPagePermission('PROJECT', filterFavoriteItems(state.projectMenuSet)),
    ]),
});

const filterLNBItemsByPagePermission = (scope: DashboardScope, items: LNBMenu[]): LNBMenu[] => {
    const topTitle = {
        type: 'top-title',
        label: scope === 'WORKSPACE'
            ? i18n.t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE')
            : i18n.t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT'),
    } as LNBItem;
    return [topTitle, ...items];
};

const mashUpProjectGroup = (dashboardList: DashboardModel[] = []): LNBMenu[] => {
    const dashboardItemsWithGroup = {} as Record<string, DashboardModel[]>;
    dashboardList.forEach((d) => {
        const projectGroupLabel: string = storeState.projects[d.project_id]?.label || d.project_id;
        if (dashboardItemsWithGroup[projectGroupLabel]) {
            dashboardItemsWithGroup[projectGroupLabel].push(d);
        } else {
            dashboardItemsWithGroup[projectGroupLabel] = [d];
        }
    });

    // Result to return
    const result = [] as LNBMenu[];

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
                id: board.dashboard_id,
                label: board.name,
                to: {
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    params: {
                        dashboardId: board.dashboard_id,
                    },
                },
                favoriteOptions: {
                    type: FAVORITE_TYPE.DASHBOARD,
                    id: board.dashboard_id,
                },
                icon: board.dashboard_type === 'PRIVATE' ? PRIVATE_ICON : undefined,
            })),
        ]);
    });

    // Return LNBMenu type as (LNBItem | LNBItem[])[]
    return result;
};

const filterFavoriteItems = (menuItems: LNBMenu[] = []): LNBMenu[] => {
    if (!state.showFavoriteOnly) return menuItems;
    const result = [] as LNBMenu[];
    menuItems.forEach((d) => {
        if (Array.isArray(d)) {
            const filtered = d.filter((menu) => (menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id]) || menu.type !== MENU_ITEM_TYPE.ITEM);
            const hasProject = filtered.filter((f) => f.type === 'item').length > 0;
            if (hasProject) result.push(filtered);
        } else if ((d.id && state.favoriteItemMap[d.favoriteOptions?.id || d.id]) || d.type !== MENU_ITEM_TYPE.ITEM) result.push(d);
    });
    return result;
};

(async () => {
    await dashboardStore.load();
})();
</script>

<template>
    <l-n-b class="dashboards-lnb"
           :menu-set="state.menuSet"
           :show-favorite-only.sync="state.showFavoriteOnly"
    >
        <template #header>
            <div class="header-wrapper">
                <span>{{ state.header }}</span>
                <p-icon-button name="ic_plus_bold"
                               size="sm"
                               @click="$router.push({ name: DASHBOARDS_ROUTE.CREATE._NAME, path: DASHBOARDS_ROUTE.CREATE._NAME })"
                />
            </div>
        </template>
    </l-n-b>
</template>

<style lang="postcss" scoped>
.dashboards-lnb {
    .header-wrapper {
        @apply flex justify-between items-center font-bold;
        padding-right: 1.25rem;
    }
}
</style>
