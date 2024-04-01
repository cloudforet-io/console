<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PLazyImg, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { getCompoundKeyWithManagedCostQuerySetFavoriteKey } from '@/lib/helper/config-data-helper';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteConfig } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { gray } from '@/styles/colors';

import { MANAGED_COST_QUERY_SET_ID_LIST } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';

const DATA_SOURCE_MENU_ID = 'data-source';
const STARRED_MENU_ID = 'starred';

const costQuerySetStore = useCostQuerySetStore();
const costQuerySetGetters = costQuerySetStore.getters;
const costQuerySetState = costQuerySetStore.state;
const allReferenceStore = useAllReferenceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;

const router = useRouter();
const route = useRoute();

const { getProperRouteLocation } = useProperRouteLocation();

const appContextStore = useAppContextStore();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    favoriteItems: computed(() => favoriteGetters.costAnalysisItems),
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    dataSourceMap: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    loading: true,
    currentPath: computed(() => route.fullPath),
    currentQueryMenuList: computed<LSBMenu>(() => costQuerySetState.costQuerySetList.map((d) => {
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
    })),
    queryMenuSet: computed<LSBMenu>(() => [
        ...filterMenuItems(state.currentQueryMenuList),
    ]),
    adminMenuSet: computed<LSBMenu>(() => (!storeState.isAdminMode ? [
        {
            type: MENU_ITEM_TYPE.COLLAPSIBLE,
            label: i18n.t('COMMON.STARRED'),
            id: STARRED_MENU_ID,
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
    ] : [])),
    favoriteItemMap: computed(() => {
        const result: Record<string, FavoriteConfig> = {};
        storeState.favoriteItems?.forEach((d) => {
            result[d.itemId] = d;
        });
        return result;
    }),
    starredMenuSet: computed<LSBMenu[]>(() => filterStarredItems(state.currentQueryMenuList)),
    menuSet: computed<LSBMenu[]>(() => [
        {
            type: MENU_ITEM_TYPE.COLLAPSIBLE,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DATA_SOURCE'),
            id: DATA_SOURCE_MENU_ID,
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
        ...state.adminMenuSet,
        ...state.queryMenuSet,
    ]),
});

const dataSourceState = reactive({
    items: computed<MenuItem[]>(() => {
        const dataSourceMap: CostDataSourceReferenceMap = storeState.dataSourceMap;
        return Object.entries(dataSourceMap).map(([key, value]) => ({
            name: key,
            label: value.name,
            imageUrl: storeState.plugins[value.data.plugin_info?.plugin_id]?.icon ? storeState.plugins[value.data.plugin_info?.plugin_id]?.icon : 'error',
        }));
    }),
    selected: computed(() => costQuerySetState.selectedDataSourceId ?? Object.keys(storeState.dataSourceMap)[0]),
});

const filterMenuItems = (menuItems: LSBItem[] = []): LSBItem[] => menuItems.filter((menu) => !(menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id])
        || menu.type !== MENU_ITEM_TYPE.ITEM);
const filterStarredItems = (menuItems: LSBItem[] = []): LSBItem[] => menuItems.filter((menu) => (menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id])
    && menu.type === MENU_ITEM_TYPE.ITEM);

const getCurrentCurrencySet = (dataSourceKey: string): string => {
    const defaultCurrencySet = `${CURRENCY_SYMBOL.USD}${CURRENCY.USD}`;

    const currentCurrency: string = storeState.dataSourceMap[dataSourceKey]?.data.plugin_info?.metadata?.currency;
    const currentSymbol: string = CURRENCY_SYMBOL[currentCurrency];
    const result = (currentCurrency && currentSymbol) && `${currentSymbol}${currentCurrency}`;

    return result || defaultCurrencySet;
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
</script>

<template>
    <aside class="sidebar-menu">
        <l-s-b :menu-set="state.menuSet">
            <template #collapsible-contents-data-source>
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
            <template #collapsible-contents-starred>
                <div v-if="state.starredMenuSet.length > 0">
                    <l-s-b-router-menu-item v-for="(menu, idx) of state.starredMenuSet"
                                            :key="idx"
                                            :item="menu"
                                            :idx="idx"
                                            :current-path="state.currentPath"
                                            is-hide-favorite
                    />
                </div>
                <span v-else
                      class="no-data"
                >
                    <p-i class="menu-icon"
                         name="ic_star-filled"
                         height="1rem"
                         width="1rem"
                         :color="yellow[500]"
                    />
                    {{ $t('COMMON.STARRED_NO_DATA') }}
                </span>
            </template>
        </l-s-b>
    </aside>
</template>

<style scoped lang="postcss">
.sidebar-menu {
    .no-data {
        @apply flex items-start text-gray-500 text-label-md;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.125rem;
    }
    .show-more {
        margin-left: 0.5rem;
    }
    .select-options-dropdown {
        padding-right: 0.5rem;
        padding-left: 0.5rem;
    }
    .selected-item-postfix {
        @apply text-gray-500;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .selected-wrapper {
        @apply flex items-center;
        gap: 0.25rem;
    }
}
</style>
