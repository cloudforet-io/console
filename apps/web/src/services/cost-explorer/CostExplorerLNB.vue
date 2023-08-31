<script lang="ts" setup>
import {
    computed, onUnmounted, reactive,
} from 'vue';

import { PButtonModal, PI } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import LNBDividerMenuItem from '@/common/modules/navigations/lnb/modules/LNBDividerMenuItem.vue';
import LNBRouterMenuItem from '@/common/modules/navigations/lnb/modules/LNBRouterMenuItem.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

import { gray } from '@/styles/colors';

import { managedCostQuerySetIdList } from '@/services/cost-explorer/cost-analysis/config';
import RelocateDashboardNotification from '@/services/cost-explorer/modules/RelocateDashboardNotification.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostQuerySetStore } from '@/services/cost-explorer/store/cost-query-set-store';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const DATA_SOURCE_DROPDOWN_KEY = 'data-source';

const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.$state;

const state = reactive({
    loading: true,
    header: computed(() => i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER].translationId)),
    menuSet: computed<LNBMenu[]>(() => [
        ...filterCostAnalysisLNBMenuByPagePermission(state.costAnalysisMenuSet),
        ...filterLNBMenuByPermission([
            {
                type: 'item',
                id: MENU_ID.COST_EXPLORER_BUDGET,
                label: i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER_BUDGET].translationId),
                to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME },
            },
        ], store.getters['user/pagePermissionList']),
    ]),
    costAnalysisMenuSet: computed<LNBMenu[]>(() => [
        { type: MENU_ITEM_TYPE.FAVORITE_ONLY },
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER_COST_ANALYSIS].translationId),
        },
        {
            type: MENU_ITEM_TYPE.DROPDOWN,
            id: DATA_SOURCE_DROPDOWN_KEY,
            selectOptions: {
                items: costQuerySetState.dataSourceList.map((dataSource) => ({
                    name: dataSource,
                    label: dataSource,
                })),
                defaultSelected: state.selectedDataSource,
            },
        },
        ...state.queryMenuSet,
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
    ]),
    queryMenuSet: computed<LNBMenu>(() => {
        const currentQueryMenuList: LNBMenu = costQuerySetState.costQuerySetList.map((d) => ({
            type: 'item',
            id: d.cost_query_set_id,
            label: d.name,
            icon: managedCostQuerySetIdList.includes(d.cost_query_set_id) ? { name: 'ic_main-filled', color: gray[500] } : undefined,
            to: {
                name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                params: {
                    querySetId: d.cost_query_set_id,
                },
            },
            favoriteType: FAVORITE_TYPE.COST_ANALYSIS,
        }));
        return currentQueryMenuList;
    }),
});

const relocateNotificationState = reactive({
    isShow: true,
    data: computed<LNBItem>(() => ({
        type: 'item',
        id: MENU_ID.DASHBOARDS,
        // TODO: translation
        label: i18n.t('Go to Dashboard'),
        to: {
            name: DASHBOARDS_ROUTE._NAME,
            query: {
                // TODO: refactor
                filters: ['[["Cost"],"label","="]'],
            },
        },
        isNew: true,
        hideFavorite: true,
    })),
    isModalVisible: false,
});

const filterCostAnalysisLNBMenuByPagePermission = (menuSet: LNBItem[]): LNBItem[] => {
    const pagePermission = store.getters['user/pagePermissionMap'];
    const routeName = MENU_ID.COST_EXPLORER_COST_ANALYSIS;

    if (pagePermission[routeName]) return [...menuSet];
    return [];
};

const handleSelect = (id: string, selected: string) => {
    if (id === DATA_SOURCE_DROPDOWN_KEY) costQuerySetStore.$patch({ selectedDataSource: selected });
};

const handleLearnMoreRelocateNotification = () => {
    relocateNotificationState.isModalVisible = true;
};

const handleDismissRelocateNotification = () => {
    relocateNotificationState.isShow = false;
};

onUnmounted(() => {
    costQuerySetStore.$dispose();
    costQuerySetStore.$reset();
});

costQuerySetStore.listCostQuerySets();

</script>

<template>
    <aside class="sidebar-menu">
        <l-n-b :header="state.header"
               :menu-set="state.menuSet"
               @select="handleSelect"
        >
            <template #default>
                <l-n-b-router-menu-item :item="relocateNotificationState.data">
                    <template #after-text>
                        <p-i name="ic_arrow-right-up"
                             width="1rem"
                             height="1rem"
                             class="link-icon"
                        />
                    </template>
                </l-n-b-router-menu-item>
                <relocate-dashboard-notification v-if="relocateNotificationState.isShow"
                                                 @click-dismiss="handleDismissRelocateNotification"
                                                 @click-learn-more="handleLearnMoreRelocateNotification"
                />
                <l-n-b-divider-menu-item />
            </template>
        </l-n-b>
        <!--TODO: Should be replaced with lean-more modal-->
        <p-button-modal :visible.sync="relocateNotificationState.isModalVisible" />
    </aside>
</template>

<style scoped lang="postcss">
.sidebar-menu {
    .link-icon {
        margin-left: 0.25rem;
    }
}
</style>
