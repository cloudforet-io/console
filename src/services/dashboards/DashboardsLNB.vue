<template>
    <l-n-b class="dashboards-lnb"
           :menu-set="menuSet"
           :show-favorite-only.sync="showFavoriteOnly"
    >
        <template #header>
            <div class="header-wrapper">
                <span>{{ header }}</span>
                <router-link :to="{ name: DASHBOARDS_ROUTE.CREATE._NAME, path: DASHBOARDS_ROUTE.CREATE._NAME }">
                    <p-icon-button name="ic_plus_bold"
                                   size="sm"
                    />
                </router-link>
            </div>
        </template>
    </l-n-b>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PIconButton } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectDashboardModel } from '@/store/modules/dashboard/type';
import type { FavoriteConfig } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE, FAVORITE_TYPE_TO_STATE_NAME } from '@/store/modules/favorite/type';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

export default defineComponent({
    name: 'DashboardsLNB',
    components: { LNB, PIconButton },
    setup() {
        /* song-lang */
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
            workSpaceMenuSet: computed<LNBItem[]>(() => store.state.dashboard.domainItems.map((d) => ({
                type: 'item',
                id: d.domain_dashboard_id,
                label: d.name,
                to: {
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    params: {
                        dashboardId: d.domain_dashboard_id,
                    },
                },
                favoriteType: FAVORITE_TYPE.DASHBOARD,
            }))),
            projectDashboardList: computed<ProjectDashboardModel[]>(() => store.state.dashboard.projectItems),
            projectItems: computed(() => store.state.reference.project.items),
            projectMenuSet: computed<LNBMenu[]>(() => mashUpProjectGroup(state.projectDashboardList)),
            menuSet: computed<LNBMenu[]>(() => [
                {
                    type: 'item',
                    label: 'View All Dashboards', // song-lang
                    id: MENU_ID.DASHBOARDS,
                    foldable: false,
                    to: { name: DASHBOARDS_ROUTE.ALL._NAME },
                },
                { type: 'divider' },
                { type: 'favorite-only' },
                { type: 'top-title', label: i18n.t('Entire Workspace') },
                ...filterFavoriteItems(state.workSpaceMenuSet),
                { type: 'top-title', label: i18n.t('Single Project') },
                ...filterFavoriteItems(state.projectMenuSet),
            ]),
        });

        const mashUpProjectGroup = (dashboardList: ProjectDashboardModel[] = []): LNBMenu[] => {
            const dashboardItemsWithoutGroup = [] as ProjectDashboardModel[];
            const dashboardItemsWithGroup = {} as Record<string, ProjectDashboardModel[]>;
            // Since all lnbitem do not have groups, and even if they do have groups, they are not sorted.
            // Items with groups are converted to map format, and if there are no groups, they are put in noGroupList.
            dashboardList.forEach((d) => {
                // With group
                const groupId: string|undefined = state.projectItems[d.project_id]?.data.groupInfo.name;
                if (groupId) {
                    if (dashboardItemsWithGroup[groupId]) {
                        dashboardItemsWithGroup[groupId].push(d);
                    } else {
                        dashboardItemsWithGroup[groupId] = [d];
                    }
                }
                // No-group
                dashboardItemsWithoutGroup.push(d);
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
                            name: DASHBOARDS_ROUTE.DETAIL._NAME,
                            params: {
                                dashboardId: board.project_dashboard_id,
                            },
                        },
                        favoriteType: FAVORITE_TYPE.DASHBOARD,
                    })),
                ]);
            });

            // No-group items are mapped to LNBItem type and pushed to result.
            result.push(
                ...dashboardItemsWithoutGroup.map((board) => ({
                    type: MENU_ITEM_TYPE.ITEM,
                    id: board.project_dashboard_id,
                    label: board.name,
                    to: {
                        name: DASHBOARDS_ROUTE.DETAIL._NAME,
                        params: {
                            dashboardId: board.project_dashboard_id,
                        },
                    },
                    favoriteType: FAVORITE_TYPE.DASHBOARD,
                })),
            );

            // Return LNBMenu type as (LNBItem | LNBItem[])[]
            return result;
        };

        const filterFavoriteItems = (menuItems: LNBMenu[] = []): LNBMenu[] => {
            if (!state.showFavoriteOnly) return menuItems;
            const result = [] as LNBMenu[];
            menuItems.forEach((d) => {
                if (Array.isArray(d)) {
                    result.push(d.filter((menu) => (menu.id && state.favoriteItemMap[menu.id]) || menu.type !== MENU_ITEM_TYPE.ITEM));
                } else if ((d.id && state.favoriteItemMap[d.id]) || d.type !== MENU_ITEM_TYPE.ITEM) result.push(d);
            });
            return result;
        };

        (async () => {
            await Promise.allSettled([
                store.dispatch('dashboard/loadProjectDashboard'),
                store.dispatch('dashboard/loadDomainDashboard'),
            ]);
        })();

        return {
            ...toRefs(state),
            DASHBOARDS_ROUTE,
        };
    },
});
</script>

<style lang="postcss" scoped>
.dashboards-lnb {
    .header-wrapper {
        @apply flex justify-between items-center font-bold;
        padding-right: 1.25rem;
    }
}
</style>
