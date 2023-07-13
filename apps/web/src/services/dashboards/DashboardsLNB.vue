<script lang="ts" setup>
import { PIconButton } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocation } from 'vue-router';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { FavoriteConfig } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE, FAVORITE_TYPE_TO_STATE_NAME } from '@/store/modules/favorite/type';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

import type { DashboardScope } from '@/services/dashboards/config';
import { DASHBOARD_SCOPE, DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { ProjectDashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';


const PRIVATE_ICON = 'ic_lock-filled';

const router = useRouter();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    loading: true,
    projectManagePermission: useManagePermissionState(MENU_ID.DASHBOARDS_PROJECT),
    workspaceManagePermission: useManagePermissionState(MENU_ID.DASHBOARDS_WORKSPACE),
    hasOnlyViewPermission: computed(() => !(state.projectManagePermission || state.workspaceManagePermission)),
    showFavoriteOnly: false,
    header: computed(() => t(MENU_INFO_MAP[MENU_ID.DASHBOARDS].translationId)),
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
    workspaceMenuSet: computed<LNBItem[]>(() => store.state.dashboard.domainItems.map((d) => ({
        type: 'item',
        id: d.domain_dashboard_id,
        label: d.name,
        to: {
            name: DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME,
            params: {
                dashboardId: d.domain_dashboard_id,
            },
        },
        favoriteType: FAVORITE_TYPE.DASHBOARD,
        icon: d.viewers === DASHBOARD_VIEWER.PRIVATE ? PRIVATE_ICON : undefined,
    }))),
    projectDashboardList: computed<ProjectDashboardModel[]>(() => store.state.dashboard.projectItems),
    projectItems: computed(() => store.getters['reference/projectItems']),
    projectMenuSet: computed<LNBMenu[]>(() => mashUpProjectGroup(state.projectDashboardList)),
    menuSet: computed<LNBMenu[]>(() => [
        {
            type: 'item',
            label: t('DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL'),
            id: MENU_ID.DASHBOARDS,
            foldable: false,
            to: { name: DASHBOARDS_ROUTE.ALL._NAME } as RouteLocation,
            hideFavorite: true,
        },
        { type: 'divider' },
        { type: 'favorite-only' },
        ...filterLNBItemsByPagePermission(DASHBOARD_SCOPE.DOMAIN, filterFavoriteItems(state.workspaceMenuSet)),
        ...filterLNBItemsByPagePermission(DASHBOARD_SCOPE.PROJECT, filterFavoriteItems(state.projectMenuSet)),
    ]),
});

const filterLNBItemsByPagePermission = (scope: DashboardScope, items: LNBMenu[]): LNBMenu[] => {
    const topTitle = {
        type: 'top-title',
        label: scope === DASHBOARD_SCOPE.DOMAIN
            ? t('DASHBOARDS.ALL_DASHBOARDS.ENTIRE_WORKSPACE')
            : t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT'),
    } as LNBItem;
    const routeName = scope === DASHBOARD_SCOPE.DOMAIN ? MENU_ID.DASHBOARDS_WORKSPACE : MENU_ID.DASHBOARDS_PROJECT;
    const pagePermission = store.getters['user/pagePermissionMap'];

    if (pagePermission[routeName]) return [topTitle, ...items];
    return [];
};

const mashUpProjectGroup = (dashboardList: ProjectDashboardModel[] = []): LNBMenu[] => {
    const dashboardItemsWithGroup = {} as Record<string, ProjectDashboardModel[]>;
    dashboardList.forEach((d) => {
        const projectGroupLabel: string|undefined = state.projectItems[d.project_id]?.label;
        if (projectGroupLabel) {
            if (dashboardItemsWithGroup[projectGroupLabel]) {
                dashboardItemsWithGroup[projectGroupLabel].push(d);
            } else {
                dashboardItemsWithGroup[projectGroupLabel] = [d];
            }
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
                id: board.project_dashboard_id,
                label: board.name,
                to: {
                    name: DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME,
                    params: {
                        dashboardId: board.project_dashboard_id,
                    } as RouteLocation['params'],
                } as RouteLocation,
                favoriteType: FAVORITE_TYPE.DASHBOARD,
                icon: board.viewers === DASHBOARD_VIEWER.PRIVATE ? PRIVATE_ICON : undefined,
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
            const filtered = d.filter((menu) => (menu.id && state.favoriteItemMap[menu.id]) || menu.type !== MENU_ITEM_TYPE.ITEM);
            const hasProject = filtered.filter((f) => f.type === 'item').length > 0;
            if (hasProject) result.push(filtered);
        } else if ((d.id && state.favoriteItemMap[d.id]) || d.type !== MENU_ITEM_TYPE.ITEM) result.push(d);
    });
    return result;
};

(async () => {
    await store.dispatch('dashboard/loadAllDashboard');
})();

</script>

<template>
    <l-n-b v-model:show-favorite-only="state.showFavoriteOnly"
           class="dashboards-lnb"
           :menu-set="state.menuSet"
    >
        <template #header>
            <div class="header-wrapper">
                <span>{{ state.header }}</span>
                <p-icon-button name="ic_plus_bold"
                               size="sm"
                               :disabled="state.hasOnlyViewPermission"
                               @click="router.push({ name: DASHBOARDS_ROUTE.CREATE._NAME, path: DASHBOARDS_ROUTE.CREATE._NAME })"
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
