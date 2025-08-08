<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PLazyImg, PSelectDropdown, PI, PToggleButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { MenuAttachHandler } from '@cloudforet/mirinae/types/hooks/use-context-menu-attach/use-context-menu-attach';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDomainStore } from '@/store/domain/domain-store';
import { useUserStore } from '@/store/user/user-store';

import { getCompoundKeyWithManagedCostQuerySetFavoriteKey } from '@/lib/helper/config-data-helper';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteConfig } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import {
    yellow, gray,
} from '@/styles/colors';

import { useCostQuerySetQuery } from '@/services/cost-explorer/composables/use-cost-query-set-query';
import {
    DEFAULT_UNIFIED_COST_CURRENCY, UNIFIED_COST_KEY,
} from '@/services/cost-explorer/constants/cost-explorer-constant';
import { MANAGED_COST_QUERY_SET_ID_LIST } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';

const DATA_SOURCE_MENU_ID = 'data-source';
const STARRED_MENU_ID = 'starred';

const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.state;
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const domainStore = useDomainStore();
const domainGetters = domainStore.getters;

const router = useRouter();
const route = useRoute();
const resourceMenuHandlerMap = useResourceMenuHandlerMap();

const appContextStore = useAppContextStore();
const userStore = useUserStore();

const referenceMap = useAllReferenceDataModel();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    favoriteItems: computed(() => favoriteGetters.costAnalysisItems),
    unifiedCostCurrency: computed(() => domainGetters.domainUnifiedCostCurrency ?? DEFAULT_UNIFIED_COST_CURRENCY),
    isAdminUser: computed<boolean>(() => userStore.state.roleType === 'DOMAIN_ADMIN'),
});
const state = reactive({
    loading: true,
    currentPath: computed(() => route.fullPath),
    currentQueryMenuList: computed<LSBMenu>(() => (costQuerySetList.value || []).map((d) => {
        if (MANAGED_COST_QUERY_SET_ID_LIST.includes(d.cost_query_set_id)) {
            return {
                type: 'item',
                id: d.cost_query_set_id,
                label: d.name,
                icon: {
                    name: 'ic_main-filled',
                    color: gray[500],
                },
                to: {
                    name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                    params: {
                        dataSourceId: costQuerySetState.isUnifiedCostOn ? UNIFIED_COST_KEY : (costQuerySetState.selectedDataSourceId ?? ''),
                        costQuerySetId: d.cost_query_set_id,
                    },
                },
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
            to: {
                name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                params: {
                    dataSourceId: costQuerySetState.isUnifiedCostOn ? UNIFIED_COST_KEY : (costQuerySetState.selectedDataSourceId ?? ''),
                    costQuerySetId: d.cost_query_set_id,
                },
            },
            favoriteOptions: {
                type: FAVORITE_TYPE.COST_ANALYSIS,
            },
        };
    })),
    queryMenuSet: computed<LSBMenu>(() => state.currentQueryMenuList),
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
    selectedDataSourceId: computed<string>(() => costQuerySetState.selectedDataSourceId || ''),
    dataSourceMenuHandler: computed<MenuAttachHandler>(() => resourceMenuHandlerMap.costDataSource()),
});

/* Query */
const { costQuerySetList, managedCostQuerySets } = useCostQuerySetQuery({
    data_source_id: computed(() => {
        if (costQuerySetState.isUnifiedCostOn) return UNIFIED_COST_KEY;
        return costQuerySetState.selectedDataSourceId || '';
    }),
    isUnifiedCostOn: computed(() => costQuerySetState.isUnifiedCostOn),
    selectedQuerySetId: computed(() => costQuerySetState.selectedQuerySetId),
});

const filterStarredItems = (menuItems: LSBItem[] = []): LSBItem[] => menuItems.filter((menu) => (menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id])
    && menu.type === MENU_ITEM_TYPE.ITEM);


/* Event Handler */
const handleSelectDataSource = (selected: string | number | SelectDropdownMenuItem[]) => {
    if (!selected || Array.isArray(selected)) return;
    const selectedString = typeof selected === 'string' ? selected : selected.toString();
    costQuerySetStore.setSelectedDataSourceId(selectedString);
    router.push({
        name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            dataSourceId: selectedString,
            costQuerySetId: managedCostQuerySets.value[0]?.cost_query_set_id,
        },
    }).catch(() => {});
};

const handleSelectUnifiedCostToggle = (value: boolean) => {
    costQuerySetStore.setUnifiedCostOn(value);
    router.push({
        name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            dataSourceId: value ? UNIFIED_COST_KEY : (costQuerySetState.selectedDataSourceId ?? UNIFIED_COST_KEY),
            costQuerySetId: managedCostQuerySets.value[0]?.cost_query_set_id,
        },
    }).catch(() => {});
};

(() => {
    const isUnifiedCostRoute = route.params.dataSourceId === UNIFIED_COST_KEY;
    costQuerySetStore.setUnifiedCostOn(isUnifiedCostRoute || storeState.isAdminMode);
})();

</script>

<template>
    <l-s-b :menu-set="state.menuSet"
           class="cost-analysis-l-s-b"
    >
        <template #collapsible-contents-data-source>
            <div class="data-source-contents-wrapper">
                <div class="unified-cost-toggle-wrapper">
                    <p-toggle-button :value="costQuerySetState.isUnifiedCostOn"
                                     @change-toggle="handleSelectUnifiedCostToggle"
                    /><span>Unified Cost</span>
                </div>
                <p-select-dropdown class="select-options-dropdown"
                                   :disabled="costQuerySetState.isUnifiedCostOn"
                                   :handler="dataSourceState.dataSourceMenuHandler"
                                   use-fixed-menu-style
                                   is-fixed-width
                                   :page-size="10"
                                   @update:selected="handleSelectDataSource"
                >
                    <template #dropdown-button>
                        <div v-if="dataSourceState.selectedDataSourceId"
                             class="selected-wrapper"
                        >
                            <p-lazy-img class="selected-icon"
                                        :src="referenceMap.plugin[referenceMap.costDataSource[dataSourceState.selectedDataSourceId]?.data?.plugin_info?.plugin_id ?? '']?.icon || 'error'"
                                        width="1rem"
                                        height="1rem"
                            />
                            <span class="selected-text">
                                {{ referenceMap.costDataSource[dataSourceState.selectedDataSourceId]?.name }}
                            </span>
                        </div>
                    </template>
                    <template #menu-item--format="{item}">
                        <div class="data-source-menu-item">
                            <p-lazy-img class="selected-icon"
                                        :src="referenceMap.plugin[referenceMap.costDataSource[item.name]?.data?.plugin_info?.plugin_id ?? '']?.icon || 'error'"
                                        width="1rem"
                                        height="1rem"
                            />
                            <span class="label">{{ item.label }}</span>
                        </div>
                    </template>
                </p-select-dropdown>
            </div>
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
</template>

<style scoped lang="postcss">
.cost-analysis-l-s-b {
    .no-data {
        @apply flex items-start text-gray-500 text-label-md;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.125rem;
    }

    .data-source-contents-wrapper {
        @apply flex flex-col gap-2;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        padding-top: 0.5rem;

        .unified-cost-toggle-wrapper {
            @apply flex items-center gap-2;

            > span {
                @apply text-label-md text-gray-900;
            }
        }
        .select-options-dropdown {

            .menu-item-wrapper {
                @apply flex justify-between;
            }
        }
    }

    .selected-item-postfix {
        @apply text-gray-500;
    }
    .beta {
        margin-left: 0.125rem;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .selected-wrapper {
        @apply flex items-center;
        gap: 0.25rem;
    }

    .data-source-menu-item {
        @apply flex items-center;
        gap: 0.25rem;
    }
}
</style>
