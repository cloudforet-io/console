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
        const state = reactive({
            loading: true,
            showFavoriteOnly: false,
            header: computed(() => i18n.t(MENU_INFO_MAP[MENU_ID.DASHBOARDS].translationId)),
            favoriteItemMap: computed(() => {
                const stateName = FAVORITE_TYPE_TO_STATE_NAME[FAVORITE_TYPE.MENU];
                const result: Record<string, FavoriteConfig> = {};
                if (stateName) {
                    store.state.favorite[stateName]?.forEach((d) => {
                        result[d.itemId] = d;
                    });
                }
                return result;
            }),
            workSpaceMenuSet: computed<LNBItem[]>(() => ([
                {
                    type: 'item', id: 'Menu Item', label: 'Menu Item', to: { name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId: 'work_01' } },
                },
                {
                    type: 'item', id: 'Budget Summary', label: 'Budget Summary', to: { name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId: 'work_02' } },
                },
            ])),
            projectMenuSet: computed<LNBItem[][]>(() => {
                const result = [] as LNBItem[][];
                const projects: LNBItem[][] = [
                    [{
                        type: 'title',
                        label: 'Project_01',
                        id: 'Project_01',
                        foldable: true,
                    },
                    {
                        type: 'item', id: 'Project_01_Dashboard', label: 'Project_01_Dashboard', to: { name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId: 'project_01_1' } },
                    },
                    {
                        type: 'item', id: 'Project_01_Dashboard2', label: 'Project_01_Dashboard2', to: { name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId: 'project_01_2' } },
                    }],
                    [{
                        type: 'title',
                        label: 'Project_02',
                        id: 'Project_02',
                        foldable: true,
                    },
                    {
                        type: 'item', id: 'Project_02_Dashboard', label: 'Project_02_Dashboard', to: { name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId: 'project_02_1' } },
                    },
                    {
                        type: 'item', id: 'Project_02_Dashboard2', label: 'Project_02_Dashboard2', to: { name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId: 'project_02_2' } },
                    }],
                ];
                projects.forEach((d) => {
                    result.push(filterFavoriteItems(d));
                });
                return result;
            }),
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
                { type: 'top-title', label: 'Workspace' },
                ...filterFavoriteItems(state.workSpaceMenuSet),
                { type: 'top-title', label: 'Project' },
                ...filterFavoriteItems(state.projectMenuSet),
            ]),
        });

        const filterFavoriteItems = (menuItems: LNBItem[] = []) => {
            if (!state.showFavoriteOnly) return menuItems;
            return menuItems.filter((d) => (d.id && state.favoriteItemMap[d.id]) || d.type !== MENU_ITEM_TYPE.ITEM);
        };

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
