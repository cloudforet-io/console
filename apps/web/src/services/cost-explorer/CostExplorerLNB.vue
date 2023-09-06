<script lang="ts" setup>
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PI, PCollapsibleToggle, PSelectDropdown, PLazyImg,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import ErrorHandler from '@/common/composables/error/errorHandler';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import LNBDividerMenuItem from '@/common/modules/navigations/lnb/modules/LNBDividerMenuItem.vue';
import LNBRouterMenuItem from '@/common/modules/navigations/lnb/modules/LNBRouterMenuItem.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

import { gray } from '@/styles/colors';

import { managedCostQuerySetIdList } from '@/services/cost-explorer/cost-analysis/config';
import RelocateDashboardModal from '@/services/cost-explorer/modules/RelocateDashboardModal.vue';
import RelocateDashboardNotification from '@/services/cost-explorer/modules/RelocateDashboardNotification.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostQuerySetStore } from '@/services/cost-explorer/store/cost-query-set-store';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';


const FOLDING_COUNT_BY_SHOW_MORE = 7;
const DATA_SOURCE_MENU_ID = 'data-source-dropdown';
const SHOW_MORE_MENU_ID = 'show-more';

const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.$state;
const allReferenceStore = useAllReferenceStore();

const route = useRoute();
const router = useRouter();

const state = reactive({
    loading: true,
    header: computed<string>(() => i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER].translationId) as string),
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
            type: MENU_ITEM_TYPE.SLOT,
            id: DATA_SOURCE_MENU_ID,
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
            icon: managedCostQuerySetIdList.includes(d.cost_query_set_id) ? {
                name: 'ic_main-filled',
                color: gray[500],
            } : undefined,
            to: {
                name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                params: {
                    dataSourceId: costQuerySetState.selectedDataSourceId ?? '',
                    costQuerySetId: d.cost_query_set_id,
                },
            },
            favoriteType: FAVORITE_TYPE.COST_ANALYSIS,
        }));
        const showMoreMenuSet: LNBMenu = [{
            type: 'slot',
            id: SHOW_MORE_MENU_ID,
        }];

        return [
            ...(state.showMoreQuerySetStatus ? currentQueryMenuList.slice(0, FOLDING_COUNT_BY_SHOW_MORE) : currentQueryMenuList),
            ...(currentQueryMenuList.length > FOLDING_COUNT_BY_SHOW_MORE ? showMoreMenuSet : []),
        ];
    }),
    showMoreQuerySetStatus: true,
    showFavoriteOnly: false,
});
const dataSourceState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    dataSourceMap: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.allReferenceTypeInfo.costDataSource.referenceMap),
    items: computed<MenuItem[]>(() => {
        const dataSourceMap: CostDataSourceReferenceMap = dataSourceState.dataSourceMap;
        const dataSourceMenuItemList = Object.entries(dataSourceMap).map(([key, value]) => ({
            name: key,
            label: value.name,
            imageUrl: dataSourceState.plugins[value.data.plugin_info?.plugin_id]?.icon,
        }));
        return dataSourceMenuItemList;
    }),
    selected: computed(() => costQuerySetState.selectedDataSourceId ?? Object.keys(dataSourceState.dataSourceMap)[0]),
});
const relocateNotificationState = reactive({
    isShow: false,
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
        // TODO: may be isUpdated?
        isNew: true,
        hideFavorite: true,
    })),
    isModalVisible: false,
    userId: computed(() => store.state.user.userId),
});

const filterCostAnalysisLNBMenuByPagePermission = (menuSet: LNBItem[]): LNBItem[] => {
    const pagePermission = store.getters['user/pagePermissionMap'];
    const routeName = MENU_ID.COST_EXPLORER_COST_ANALYSIS;

    if (pagePermission[routeName]) return [...menuSet];
    return [];
};

const handleSelectDataSource = (selected: string) => {
    costQuerySetStore.$patch({ selectedDataSourceId: selected });
    router.push({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            dataSourceId: selected,
            costQuerySetId: managedCostQuerySetIdList[0],
        },
    }).catch(() => {});
};

const handleLearnMoreRelocateNotification = () => {
    relocateNotificationState.isModalVisible = true;
};

const handleDismissRelocateNotification = () => {
    const settings = LocalStorageAccessor.getItem(relocateNotificationState.userId);
    settings.costExplorer = {
        ...settings.costExplorer,
        hideRelocateDashboardNotification: true,
    };
    LocalStorageAccessor.setItem(relocateNotificationState.userId, settings);
    relocateNotificationState.isShow = false;
};



onMounted(() => {
    // Relocate dashboard notification
    const settings = LocalStorageAccessor.getItem(relocateNotificationState.userId);
    if (!settings.costExplorer?.hideRelocateDashboardNotification) {
        relocateNotificationState.isModalVisible = true;
        relocateNotificationState.isShow = true;
    }
});

onUnmounted(() => {
    costQuerySetStore.$dispose();
    costQuerySetStore.$reset();
});

watch(() => route.params, async (params) => {
    // Case - Directly access Budget Page
    if (!costQuerySetState.selectedDataSourceId) {
        const fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);
        try {
            const { status, response } = await fetcher({
                query: {
                    only: ['data_source_id'],
                },
            });
            if (status === 'succeed') {
                const dataSourceId = response.results[0].data_source_id;
                costQuerySetStore.$patch({
                    selectedDataSourceId: dataSourceId,
                });
            }
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }

    /*
    * Both parameters are set in the route. (beforeEnter navigation guard in route.ts)
    * */
    if (params.dataSourceId && params.costQuerySetId) {
        costQuerySetStore.$patch({
            selectedDataSourceId: params.dataSourceId,
            selectedQuerySetId: params.costQuerySetId,
        });
    }
    await costQuerySetStore.listCostQuerySets();
}, { immediate: true });

</script>

<template>
    <aside class="sidebar-menu">
        <l-n-b :header="state.header"
               :menu-set="state.menuSet"
               :show-favorite-only.sync="state.showFavoriteOnly"
        >
            <template #default>
                <l-n-b-router-menu-item :item="relocateNotificationState.data"
                                        open-new-tab
                >
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
            <template #slot-show-more>
                <p-collapsible-toggle :is-collapsed.sync="state.showMoreQuerySetStatus" />
            </template>
            <template #slot-data-source-dropdown>
                <p-select-dropdown class="select-options-dropdown"
                                   :items="dataSourceState.items"
                                   :selected="dataSourceState.selected"
                                   use-fixed-menu-style
                                   is-fixed-width
                                   @update:selected="handleSelectDataSource"
                >
                    <template #default="{ item }">
                        <div class="selected-wrapper">
                            <p-lazy-img v-if="item && item.imageUrl"
                                        class="left-icon"
                                        :src="item.imageUrl"
                                        width="1rem"
                                        height="1rem"
                            />
                            <span class="selected-text">
                                {{ item?.label }}
                            </span>
                        </div>
                    </template>
                </p-select-dropdown>
            </template>
        </l-n-b>
        <relocate-dashboard-modal :visible.sync="relocateNotificationState.isModalVisible" />
    </aside>
</template>

<style scoped lang="postcss">
.sidebar-menu {
    .link-icon {
        margin-left: 0.25rem;
    }
    .select-options-dropdown {
        @apply w-full;
        .selected-wrapper {
            @apply flex items-center w-full;
            .left-icon {
                margin-right: 0.25rem;
                flex-shrink: 0;
            }
            .selected-text {
                flex-grow: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}
</style>
