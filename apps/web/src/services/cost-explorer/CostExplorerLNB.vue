<script setup lang="ts">
import {
    computed, onMounted, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PCollapsibleToggle, PSelectDropdown, PLazyImg,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { FavoriteConfig } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE, FAVORITE_TYPE_TO_STATE_NAME } from '@/store/modules/favorite/type';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import {
    filterLNBMenuByAccessPermission,
} from '@/lib/access-control/page-access-helper';
import {
    getCompoundKeyWithManagedCostQuerySetFavoriteKey,
} from '@/lib/helper/config-data-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import LNBDividerMenuItem from '@/common/modules/navigations/lnb/modules/LNBDividerMenuItem.vue';
import LNBRouterMenuItem from '@/common/modules/navigations/lnb/modules/LNBRouterMenuItem.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

import { gray } from '@/styles/colors';

import CostExplorerLNBRelocateDashboardModal from '@/services/cost-explorer/components/CostExplorerLNBRelocateDashboardModal.vue';
import CostExplorerLNBRelocateDashboardNotification from '@/services/cost-explorer/components/CostExplorerLNBRelocateDashboardNotification.vue';
import { MANAGED_COST_QUERY_SET_ID_LIST } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import type { RelocateDashboardStatus } from '@/services/cost-explorer/stores/cost-explorer-settings-store';
import {
    useCostExplorerSettingsStore,
} from '@/services/cost-explorer/stores/cost-explorer-settings-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


const FOLDING_COUNT_BY_SHOW_MORE = 7;
const DATA_SOURCE_MENU_ID = 'data-source-dropdown';
const SHOW_MORE_MENU_ID = 'show-more';

const costQuerySetStore = useCostQuerySetStore();
const costQuerySetGetters = costQuerySetStore.getters;
const costQuerySetState = costQuerySetStore.state;
const costExplorerSettingsStore = useCostExplorerSettingsStore();
const costExplorerSettingsState = costExplorerSettingsStore.$state;
const allReferenceStore = useAllReferenceStore();

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const appContextStore = useAppContextStore();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: true,
    header: computed<string>(() => i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER].translationId) as string),
    menuSet: computed<LNBMenu[]>(() => [
        ...filterCostAnalysisLNBMenuByPagePermission(state.costAnalysisMenuSet),
        ...filterLNBMenuByAccessPermission([
            {
                type: 'item',
                id: MENU_ID.BUDGET,
                label: i18n.t(MENU_INFO_MAP[MENU_ID.BUDGET].translationId),
                to: getProperRouteLocation({ name: COST_EXPLORER_ROUTE.BUDGET._NAME }),
            },
        ], store.getters['user/pageAccessPermissionList']),
    ]),
    costAnalysisMenuSet: computed<LNBMenu[]>(() => [
        (storeState.isAdminMode ? {} : { type: MENU_ITEM_TYPE.FAVORITE_ONLY }),
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t(MENU_INFO_MAP[MENU_ID.COST_ANALYSIS].translationId),
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
        const currentQueryMenuList: LNBMenu = costQuerySetState.costQuerySetList.map((d) => {
            if (MANAGED_COST_QUERY_SET_ID_LIST.includes(d.cost_query_set_id)) {
                return {
                    type: 'item',
                    id: d.cost_query_set_id,
                    label: d.name,
                    icon: {
                        name: 'ic_main-filled',
                        color: gray[500],
                    },
                    to: getProperRouteLocation({
                        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                        params: {
                            dataSourceId: costQuerySetState.selectedDataSourceId ?? '',
                            costQuerySetId: d.cost_query_set_id,
                        },
                    }),
                    favoriteOptions: {
                        type: FAVORITE_TYPE.COST_ANALYSIS,
                        id: getCompoundKeyWithManagedCostQuerySetFavoriteKey(d.data_source_id, d.cost_query_set_id),
                    },
                };
            }
            return {
                type: 'item',
                id: d.cost_query_set_id,
                label: d.name,
                to: getProperRouteLocation({
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                    params: {
                        dataSourceId: costQuerySetState.selectedDataSourceId ?? '',
                        costQuerySetId: d.cost_query_set_id,
                    },
                }),
                favoriteOptions: {
                    type: FAVORITE_TYPE.COST_ANALYSIS,
                },
            };
        });

        const showMoreMenuSet: LNBMenu = [{
            type: 'slot',
            id: SHOW_MORE_MENU_ID,
        }];

        return [
            ...filterFavoriteItems(state.showMoreQuerySetStatus ? currentQueryMenuList.slice(0, FOLDING_COUNT_BY_SHOW_MORE) : currentQueryMenuList),
            ...(currentQueryMenuList.length > FOLDING_COUNT_BY_SHOW_MORE ? showMoreMenuSet : []),
        ];
    }),
    favoriteItemMap: computed(() => {
        const stateName = FAVORITE_TYPE_TO_STATE_NAME[FAVORITE_TYPE.COST_ANALYSIS];
        const result: Record<string, FavoriteConfig> = {};
        if (stateName) {
            store.state.favorite[stateName]?.forEach((d) => {
                result[d.itemId] = d;
            });
        }
        return result;
    }),
    showMoreQuerySetStatus: true,
    showFavoriteOnly: false,
});

const dataSourceState = reactive({
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    dataSourceMap: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    items: computed<MenuItem[]>(() => {
        const dataSourceMap: CostDataSourceReferenceMap = dataSourceState.dataSourceMap;
        const dataSourceMenuItemList = Object.entries(dataSourceMap).map(([key, value]) => ({
            name: key,
            label: value.name,
            imageUrl: dataSourceState.plugins[value.data.plugin_info?.plugin_id]?.icon ? dataSourceState.plugins[value.data.plugin_info?.plugin_id]?.icon : 'error',
        }));
        return dataSourceMenuItemList;
    }),
    selected: computed(() => costQuerySetState.selectedDataSourceId ?? Object.keys(dataSourceState.dataSourceMap)[0]),
});
const relocateNotificationState = reactive({
    isBannerVisible: false,
    isModalVisible: false,
    data: computed<LNBItem>(() => {
        const dashboardQuery = new QueryHelper().setFilters([{
            k: 'label',
            v: ['Cost'],
            o: '=',
        }]).rawQueryStrings;
        return ({
            type: 'item',
            id: MENU_ID.DASHBOARDS,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_DASHBOARD_LABEL'),
            to: getProperRouteLocation({
                name: DASHBOARDS_ROUTE.ALL._NAME,
                query: {
                    filters: dashboardQuery,
                },
            }),
            // TODO: may be isUpdated?
            highlightTag: 'update',
            hideFavorite: true,
        });
    }),
    userId: computed(() => store.state.user.userId),
});

const filterFavoriteItems = (menuItems: LNBItem[] = []): LNBItem[] => {
    if (!state.showFavoriteOnly) return menuItems;
    return menuItems.filter((menu) => (menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id]) || menu.type !== MENU_ITEM_TYPE.ITEM);
};

const getCurrentCurrencySet = (dataSourceKey: string): string => {
    const defaultCurrencySet = `${CURRENCY_SYMBOL.USD}${CURRENCY.USD}`;

    const currentCurrency: string = dataSourceState.dataSourceMap[dataSourceKey]?.data.plugin_info?.metadata?.currency;
    const currentSymbol: string = CURRENCY_SYMBOL[currentCurrency];
    const result = (currentCurrency && currentSymbol) && `${currentSymbol}${currentCurrency}`;

    return result || defaultCurrencySet;
};

const filterCostAnalysisLNBMenuByPagePermission = (menuSet: LNBItem[]): LNBItem[] => {
    const pagePermission = store.getters['user/pageAccessPermissionMap'];
    const routeName = MENU_ID.COST_ANALYSIS;

    if (pagePermission[routeName]) return [...menuSet];
    return [];
};

const handleSelectDataSource = (selected: string) => {
    if (!selected) return;
    costQuerySetStore.setSelectedDataSourceId(selected);
    router.push(getProperRouteLocation({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            dataSourceId: selected,
            costQuerySetId: costQuerySetGetters.managedCostQuerySets[0].cost_query_set_id,
        },
    })).catch(() => {});
};

const handleLearnMoreRelocateNotification = () => {
    relocateNotificationState.isModalVisible = true;
};

const handleDismissRelocateNotification = () => {
    costExplorerSettingsStore.setRelocateDashboardState({
        ...costExplorerSettingsState.relocateDashboardStatus,
        hideBanner: true,
    });
    relocateNotificationState.isBannerVisible = false;
};

onMounted(() => {
    // Relocate dashboard notification
    const relocateDashboardStatus: RelocateDashboardStatus|undefined = costExplorerSettingsStore.getRelocateDashboardStatus;
    relocateNotificationState.isBannerVisible = !relocateDashboardStatus?.hideBanner;
    relocateNotificationState.isModalVisible = !relocateDashboardStatus?.hideModal;
});

</script>

<template>
    <aside class="sidebar-menu">
        <l-n-b :header="state.header"
               :menu-set="state.menuSet"
               :show-favorite-only.sync="state.showFavoriteOnly"
        >
            <template v-if="!storeState.isAdminMode"
                      #default
            >
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
                <cost-explorer-l-n-b-relocate-dashboard-notification
                    v-if="relocateNotificationState.isBannerVisible"
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
                                   :menu="dataSourceState.items"
                                   :selected="dataSourceState.selected"
                                   use-fixed-menu-style
                                   is-fixed-width
                                   @update:selected="handleSelectDataSource"
                >
                    <template #dropdown-button="item">
                        <div class="selected-wrapper">
                            <p-lazy-img v-if="item && item.imageUrl"
                                        class="selected-icon"
                                        :src="item.imageUrl"
                                        width="1rem"
                                        height="1rem"
                            />
                            <span class="selected-text">
                                {{ item?.label }}
                            </span>
                        </div>
                    </template>
                    <template #menu-item--format="{item}">
                        <div class="menu-item">
                            <span>{{ item.label }}</span>
                            <span class="selected-item-postfix">
                                ({{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CURRENCY') }}: {{ getCurrentCurrencySet(item.name) }})
                            </span>
                        </div>
                    </template>
                </p-select-dropdown>
            </template>
        </l-n-b>
        <cost-explorer-l-n-b-relocate-dashboard-modal
            v-if="!storeState.isAdminMode"
            :visible.sync="relocateNotificationState.isModalVisible"
        />
    </aside>
</template>

<style scoped lang="postcss">
.sidebar-menu {
    .link-icon {
        margin-left: 0.25rem;
    }
    .select-options-dropdown {
        .selected-wrapper {
            @apply flex items-center;

            .selected-icon {
                margin-right: 0.25rem;
                margin-top: 0.125rem;
                flex-shrink: 0;
            }

            .selected-text {
                flex-grow: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .selected-item-postfix {
            @apply text-gray-400;
        }
    }

    /* custom design-system component - p-select-dropdown */
    :deep(.p-select-dropdown) {
        .left-icon {
            margin-right: 0.25rem;
            margin-top: 0.125rem;
            flex-shrink: 0;
        }
    }
}
</style>
