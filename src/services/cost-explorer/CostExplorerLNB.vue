<template>
    <aside class="sidebar-menu">
        <l-n-b
            v-if="!costExplorerDashboardState.dashboardListLoading"
            :header="header"
            :top-title="topTitle"
            :menu-set="menuSet"
        >
            <template #after-text="{item}">
                <p-i v-if="item.id === costExplorerDashboardGetters.homeDashboardId"
                     name="ic_home-filled"
                     width="1rem"
                     height="1rem"
                     class="ml-1"
                />
            </template>
        </l-n-b>
    </aside>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import { PI } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import ErrorHandler from '@/common/composables/error/errorHandler';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';

import type {
    PublicDashboardInfo, UserDashboardInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostExplorerDashboardStore } from '@/services/cost-explorer/store/cost-explorer-dashboard-store';

export default {
    name: 'CostExplorerLNB',
    components: {
        LNB,
        PI,
    },
    setup() {
        const costExplorerDashboardStore = useCostExplorerDashboardStore();
        const costExplorerDashboardState = costExplorerDashboardStore.state;
        const costExplorerDashboardGetters = costExplorerDashboardStore.getters;

        const state = reactive({
            loading: true,
            header: computed(() => i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER].translationId)),
            topTitle: computed(() => {
                if (isUserAccessibleToMenu(MENU_ID.COST_EXPLORER_DASHBOARD, store.getters['user/pagePermissionList'])) {
                    return {
                        label: i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER_DASHBOARD].translationId),
                        visibleAddButton: true,
                        addButtonLink: { name: COST_EXPLORER_ROUTE.DASHBOARD.CREATE._NAME },
                    };
                }
                return undefined;
            }),
            dashboardMenuSet: computed<LNBMenu[]>(() => {
                const results: LNBMenu[] = [];
                if (state.topTitle) {
                    results.push(
                        [
                            {
                                type: 'title', label: 'Public', id: 'public', foldable: false,
                            },
                            ...costExplorerDashboardState.publicDashboardList.map((list: PublicDashboardInfo) => ({
                                type: 'item',
                                label: list.name,
                                id: list.public_dashboard_id,
                                to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME, params: { dashboardId: list.public_dashboard_id } },
                                hideFavorite: true,
                            })) as LNBItem[],
                        ],
                        [
                            {
                                type: 'title', label: 'My Dashboard', id: 'my', foldable: true,
                            },
                            ...costExplorerDashboardState.userDashboardList.map((list: UserDashboardInfo) => ({
                                type: 'item',
                                label: list.name,
                                id: list.user_dashboard_id,
                                to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME, params: { dashboardId: list.user_dashboard_id } },
                                hideFavorite: true,
                            })) as LNBItem[],
                        ],
                        { type: 'divider' },
                    );
                }
                return results;
            }),
            menuSet: computed<LNBMenu[]>(() => [
                ...state.dashboardMenuSet,
                ...filterLNBMenuByPermission([
                    {
                        type: 'item',
                        id: MENU_ID.COST_EXPLORER_COST_ANALYSIS,
                        label: i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER_COST_ANALYSIS].translationId),
                        to: { name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME },
                    },
                    {
                        type: 'item',
                        id: MENU_ID.COST_EXPLORER_BUDGET,
                        label: i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER_BUDGET].translationId),
                        to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME },
                    },
                ], store.getters['user/pagePermissionList']),
            ]),
            selectedMenu: {} as LNBItem,
        });

        const listDashboard = async () => {
            try {
                state.loading = true;
                costExplorerDashboardStore.setDashboardList();
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        const handleClickCreate = () => {
            SpaceRouter.router.push({
                name: COST_EXPLORER_ROUTE.DASHBOARD.CREATE._NAME,
            });
        };

        const setInitialHomeDashboard = () => {
            costExplorerDashboardStore.setHomeDashboard(costExplorerDashboardState.publicDashboardList[0]?.public_dashboard_id);
        };

        /* Init */
        (async () => {
            await listDashboard();
            if (!costExplorerDashboardGetters.homeDashboardId) setInitialHomeDashboard();
        })();

        return {
            ...toRefs(state),
            costExplorerDashboardState,
            costExplorerDashboardGetters,
            handleClickCreate,
            COST_EXPLORER_ROUTE,
        };
    },
};
</script>
