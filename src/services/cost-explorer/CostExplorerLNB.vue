<template>
    <aside class="sidebar-menu">
        <l-n-b
            v-if="!dashboardListLoading"
            :header="header"
            :top-title="topTitle"
            :menu-set="menuSet"
        >
            <template #after-text="{item}">
                <p-i v-if="item.id === homeDashboardId" name="ic_home" width="1rem"
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
} from '@vue/composition-api';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { SpaceRouter } from '@/router';
import {
    PublicDashboardInfo, UserDashboardInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { costExplorerStore } from '@/services/cost-explorer/store';
import { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/menu/config';
import { PI } from '@spaceone/design-system';
import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { store } from '@/store';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { isUserAccessibleToMenu } from '@/lib/access-control';

export default {
    name: 'CostExplorerLNB',
    components: {
        LNB,
        PI,
    },
    setup() {
        const state = reactive({
            publicDashboardList: computed<PublicDashboardInfo[]>(() => costExplorerStore.state?.publicDashboardList ?? []),
            userDashboardList: computed<UserDashboardInfo[]>(() => costExplorerStore.state.userDashboardList ?? []),
            loading: true,
            dashboardListLoading: computed<boolean>(() => costExplorerStore.state?.dashboardListLoading ?? true),
            header: computed(() => MENU_INFO_MAP[MENU_ID.COST_EXPLORER].label),
            topTitle: computed(() => {
                if (isUserAccessibleToMenu(MENU_ID.COST_EXPLORER_DASHBOARD)) {
                    return {
                        label: MENU_ID.COST_EXPLORER_DASHBOARD,
                        visibleAddButton: true,
                        addButtonLink: { name: COST_EXPLORER_ROUTE.DASHBOARD.CREATE._NAME },
                    };
                }
                return undefined;
            }),
            dashboardMenuSet: computed<LNBMenu[]>(() => {
                const results: LNBMenu[] = [];
                if (state.topTitle) {
                    results.push([
                        {
                            type: 'title', label: 'Public', id: 'public', foldable: false,
                        },
                        ...state.publicDashboardList.map((list: PublicDashboardInfo) => ({
                            type: 'item',
                            label: list.name,
                            id: list.public_dashboard_id,
                            to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME, params: { dashboardId: list.public_dashboard_id } },
                            hideFavorite: true,
                        })),
                    ],
                    [
                        {
                            type: 'title', label: 'My Dashboard', id: 'my', foldable: true,
                        },
                        ...state.userDashboardList.map((list: UserDashboardInfo) => ({
                            type: 'item',
                            label: list.name,
                            id: list.user_dashboard_id,
                            to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME, params: { dashboardId: list.user_dashboard_id } },
                            hideFavorite: true,
                        })),
                    ],
                    { type: 'divider' });
                }
                return results;
            }),
            menuSet: computed<LNBMenu[]>(() => filterLNBMenuByPermission([
                ...state.dashboardMenuSet,
                {
                    type: 'item', id: MENU_ID.COST_EXPLORER_COST_ANALYSIS, label: 'Cost Analysis', to: { name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME },
                },
                {
                    type: 'item', id: MENU_ID.COST_EXPLORER_BUDGET, label: 'Budget', to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME },
                },
            ], store.getters['user/pagePermissionList'])),
            selectedMenu: {} as LNBItem,
            homeDashboardId: computed<string|undefined>(() => costExplorerStore.getters?.homeDashboardId),
        });

        const listDashboard = async () => {
            try {
                state.loading = true;
                await costExplorerStore.dispatch('setDashboardList');
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
            costExplorerStore.dispatch('setHomeDashboard', state.publicDashboardList[0]?.public_dashboard_id);
        };

        /* Init */
        (async () => {
            await listDashboard();
            if (!state.homeDashboardId) setInitialHomeDashboard();
        })();


        return {
            ...toRefs(state),
            handleClickCreate,
            COST_EXPLORER_ROUTE,
        };
    },
};
</script>
