<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PIconButton } from '@spaceone/design-system';

import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { FavoriteConfig } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE, FAVORITE_TYPE_TO_STATE_NAME } from '@/store/modules/favorite/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';


const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
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
    domainMenuSet: computed<LNBItem[]>(() => dashboardGetters.domainItems.map((d) => ({
        type: 'item',
        id: d.public_dashboard_id,
        label: d.name,
        to: {
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.public_dashboard_id,
            },
        },
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.public_dashboard_id,
        },
    }))),
    workspaceMenuSet: computed<LNBItem[]>(() => dashboardGetters.workspaceItems.map((d) => ({
        type: 'item',
        id: d.public_dashboard_id,
        label: d.name,
        to: {
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.public_dashboard_id,
            },
        },
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.public_dashboard_id,
        },
    }))),
    projectMenuSet: computed<LNBMenu[]>(() => mashUpProjectGroup(dashboardGetters.projectItems)),
    privateMenuSet: computed(() => dashboardGetters.privateItems.map((d) => ({
        type: 'item',
        id: d.private_dashboard_id,
        label: d.name,
        to: {
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: d.private_dashboard_id,
            },
        },
        favoriteOptions: {
            type: FAVORITE_TYPE.DASHBOARD,
            id: d.private_dashboard_id,
        },
    }))),
    menuSet: computed<LNBMenu[]>(() => {
        const defaultMenuSet = [
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
        ];

        if (storeState.isAdminMode) {
            return [
                ...defaultMenuSet,
                ...state.domainMenuSet,
            ];
        }
        return [
            ...defaultMenuSet,
            ...filterLNBItemsByPagePermission('WORKSPACE', filterFavoriteItems(state.workspaceMenuSet)),
            ...filterLNBItemsByPagePermission('PROJECT', filterFavoriteItems(state.projectMenuSet)),
            ...filterLNBItemsByPagePermission('PRIVATE', filterFavoriteItems(state.privateMenuSet)),
        ];
    }),
});

const filterLNBItemsByPagePermission = (scope: DashboardScope, items: LNBMenu[]): LNBMenu[] => {
    let label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE');
    if (scope === 'PROJECT') label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT');
    else if (scope === 'PRIVATE') label = i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
    const topTitle = {
        type: 'top-title',
        label,
    } as LNBItem;
    return [topTitle, ...items];
};

const mashUpProjectGroup = (dashboardList: PublicDashboardModel[] = []): LNBMenu[] => {
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
                id: board.public_dashboard_id,
                label: board.name,
                to: {
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    params: {
                        dashboardId: board.public_dashboard_id,
                    },
                },
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
