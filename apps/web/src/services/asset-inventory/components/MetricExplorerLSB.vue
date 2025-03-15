<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    debounce,
} from 'lodash';

import {
    PI, PSearch, PTextHighlighting, PDataLoader, PEmpty, PPopover, PButton, PCheckbox, PTooltip, PLazyImg,
} from '@cloudforet/mirinae';

import type { NamespaceGroupModel } from '@/schema/inventory-v2/namespace-group/model';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteConfig } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBCollapsibleMenuItem from '@/common/modules/navigations/lsb/modules/LSBCollapsibleMenuItem.vue';
import LSBMenuItem from '@/common/modules/navigations/lsb/modules/LSBMenuItem.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBCollapsibleItem, LSBItem } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { gray, yellow } from '@/styles/colors';

import MetricExplorerLSBMetric from '@/services/asset-inventory/components/MetricExplorerLSBMetric.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useAssetInventorySettingsStore } from '@/services/asset-inventory/stores/asset-inventory-settings-store';
import {
    useMetricExplorerLSBStore,
} from '@/services/asset-inventory/stores/metric-explorer-l-s-b-store';
import type { NamespaceSubItemType } from '@/services/asset-inventory/types/asset-analysis-type';

interface props {
  width : number
}
const props = defineProps<props>();

const lsbRef = ref<HTMLElement|null>(null);
const { width: lsbWidth } = useElementSize(lsbRef);

const route = useRoute();

const assetInventorySettingsStore = useAssetInventorySettingsStore();
const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const { getProperRouteLocation } = useProperRouteLocation();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;

const metricExplorerLSBStore = useMetricExplorerLSBStore();
const metricExplorerLSBState = metricExplorerLSBStore.state;

const storeState = reactive({
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    metricExamples: computed<MetricExampleModel[]>(() => gnbGetters.metricExamples),
    favoriteItems: computed(() => [
        ...favoriteGetters.metricItems,
        ...favoriteGetters.metricExampleItems,
    ]),
    // selectedNamespace: computed(() => metricExplorerPageState.selectedNamespace),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    // new
    namespaceGroupList: computed<NamespaceGroupModel[]>(() => metricExplorerLSBState.namespaceGroupList),
    namespaceMenuLoading: computed<boolean>(() => metricExplorerLSBState.loading),
    namespaceLoadingMap: computed<Record<string, boolean>>(() => metricExplorerLSBState.namespaceLoadingMap),
    currentMetricList: computed<MetricModel[]>(() => metricExplorerLSBState.metricList),
});

const state = reactive({
    loading: false,
    currentPath: computed(() => route.fullPath),
    currentMetricIdByUrl: computed(() => route.params.metricId),
    isDetailPage: computed(() => !!state.currentMetricIdByUrl),
    menuSet: computed(() => {
        const baseMenuSet = storeState.isAdminMode ? [] : [
            {
                type: MENU_ITEM_TYPE.STARRED,
                childItems: state.starredMenuSet,
                currentPath: state.currentPath,
            },
            {
                type: MENU_ITEM_TYPE.DIVIDER,
            },
        ];
        if (!metricExplorerLSBState.selectedNamespaceId) return [...baseMenuSet, state.namespaceMenu];
        return [...baseMenuSet, state.metricMenu];
    }),
    starredMenuSet: computed<LSBItem[]>(() => {
        const metricMenuList: LSBItem[] = Object.values(storeState.metrics).map((metric) => ({
            type: 'item',
            id: metric.key,
            label: metric.name,
            icon: {
                name: metric.key.startsWith('metric-managed-') ? 'ic_main-filled' : 'ic_sub',
                color: gray[500],
            },
            to: getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                params: {
                    metricId: metric.key,
                },
            }),
            favoriteOptions: {
                type: FAVORITE_TYPE.METRIC,
                id: metric.key,
            },
        }));
        const metricExampleList: LSBItem[] = storeState.metricExamples.map((example) => ({
            type: 'item',
            id: example.example_id,
            label: example.name,
            icon: 'ic_example-filled',
            to: getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
                params: {
                    metricId: example.metric_id,
                    metricExampleId: example.example_id,
                },
            }),
            favoriteOptions: {
                type: FAVORITE_TYPE.METRIC_EXAMPLE,
                id: example.example_id,
            },
        }));

        return [
            ...metricMenuList,
            ...metricExampleList,
        ].filter((menu) => menu.id && state.favoriteItemMap[menu.favoriteOptions?.id || menu.id]);
    }),
    namespaceMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('COMMON.NAMESPACE'),
        id: 'namespace',
    })),
    namespaceTopTitleMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.TOP_TITLE,
        label: i18n.t('COMMON.NAMESPACE'),
    })),
    metricMenu: computed<LSBItem>(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        id: 'metric',
    })),
    favoriteItemMap: computed(() => {
        const result: Record<string, FavoriteConfig> = {};
        storeState.favoriteItems?.forEach((d) => {
            result[d.itemId] = d;
        });
        return result;
    }),
});

const namespaceState = reactive({
    inputValue: '',
    namespaceGroupLSBItem: computed<LSBCollapsibleItem[]>(() => {
        const namespaceGroupList = storeState.namespaceGroupList;
        if (!namespaceGroupList.length) return [];
        return namespaceGroupList.map((namespaceGroup) => ({
            type: MENU_ITEM_TYPE.COLLAPSIBLE,
            label: namespaceGroup.name,
            icon: namespaceGroup.icon,
            subItems: [],
            id: namespaceGroup.namespace_group_id,
            initialCollapsed: true,
        }));
    }),
    namespaceLSBItems: computed<LSBCollapsibleItem<any>[]>(() => namespaceState.namespaceGroupLSBItem.map((groupItem) => {
        const namespaceItems = metricExplorerLSBState.namespaceMap[groupItem.id];
        if (namespaceItems) {
            return {
                ...groupItem,
                subItems: namespaceItems.map((namespace) => ({
                    label: namespace.name,
                    name: namespace.namespace_id,
                })),
            };
        }
        return groupItem;
    })),
    namespaceLSBItemsByKeywordSearch: computed<LSBCollapsibleItem<any>[]>(() => namespaceState.namespaceGroupLSBItem.map((groupItem) => {
        const namespaceItemsByKeywordSearch = metricExplorerLSBState.namespaceMapByKeywordSearch[groupItem.id];
        if (namespaceItemsByKeywordSearch) {
            return {
                ...groupItem,
                initialCollapsed: false,
                subItems: namespaceItemsByKeywordSearch.map((namespace) => ({
                    label: namespace.name,
                    name: namespace.namespace_id,
                })),
            };
        } return groupItem;
    }).filter((item) => item.subItems.length)),
});

const guidePopoverState = reactive({
    metricGuideVisible: false,
    noMore: false,
});


/* Helper */
const isSelectedNamespace = (namespace: NamespaceSubItemType): boolean => {
    if (!storeState.selectedNamespace) return false;
    return storeState.selectedNamespace.name === namespace.name
        && storeState.selectedNamespace.group === namespace.group;
};

// const customSnakeToTitleCase = (title: string) => startCase(toLower(title.replace(/_/g, ' ')));

/* Event */
const handleSearchNamespace = (keyword: string) => {
    if (keyword) namespaceState.collapsed = false; else namespaceState.collapsed = true;
    namespaceState.inputValue = keyword;
};
const handleClickNamespace = (namespace: NamespaceSubItemType) => {
    const namespaceId = namespace.name;
    metricExplorerLSBStore.setSelectedNamespaceId(namespaceId);
};
const handleConfirmMetricGuide = () => {
    if (guidePopoverState.noMore) {
        assetInventorySettingsStore.setNotShowMetricSelectGuidePopover(true);
    }
    guidePopoverState.metricGuideVisible = false;
    guidePopoverState.noMore = false;
};

// v2 event
const handleToggleNamespaceGroup = (collapsed: boolean, item: LSBCollapsibleItem) => {
    if (!collapsed && item.id) {
        const namespaceGroupId = item.id;
        metricExplorerLSBStore.loadNamespaceListByNamespaceGroupId(namespaceGroupId);
    }
};

// Whether to show metric-select-guide popover
watch(() => metricExplorerLSBState.selectedNamespaceId, (selectedNamespaceId) => {
    if (selectedNamespaceId
        && state.isDetailPage
        && !storeState.currentMetricList.map((metric) => metric.metric_id).includes(state.currentMetricIdByUrl)
        && !assetInventorySettingsStore.getNotShowMetricSelectGuidePopover
    ) {
        guidePopoverState.metricGuideVisible = true;
    } else guidePopoverState.metricGuideVisible = false;
});

watch(() => namespaceState.inputValue, (inputValue) => {
    debounce(() => {
        metricExplorerLSBStore.loadNamespaceListByKeywordSearch(inputValue);
    }, 300)();
});

watch(() => metricExplorerLSBState.selectedNamespaceId, async (selectedNamespaceId) => {
    if (selectedNamespaceId) {
        await metricExplorerLSBStore.loadMetricList(selectedNamespaceId);
    }
}, { immediate: true });

onMounted(() => {
    metricExplorerLSBStore.loadNamespaceGroupList();
});

</script>

<template>
    <div class="metric-explorer-l-s-b">
        <p-popover class="metric-select-guide-popover"
                   :is-visible.sync="guidePopoverState.metricGuideVisible"
                   position="right"
                   ignore-outside-click
                   ignore-target-click
                   boundary=".metric-explorer-l-s-b"
                   trigger="none"
                   min-width="21.5rem"
                   :style="{ left: `${lsbWidth}px`}"
        >
            <l-s-b ref="lsbRef"
                   :menu-set="state.menuSet"
                   :style="{ width: `${props.width}px` }"
            >
                <template #collapsible-contents-starred>
                    <div v-if="state.starredMenuSet.length > 0">
                        <p-tooltip v-for="(item, idx) of state.starredMenuSet"
                                   :key="`asset-analysis-starred-${idx}`"
                                   position="bottom"
                                   :contents="item.favoriteOptions?.type === FAVORITE_TYPE.METRIC_EXAMPLE ? `${storeState.metrics[item.to?.params?.metricId
                                       || '']?.name} > ${item.label}` : item.label"
                        >
                            <l-s-b-router-menu-item :item="item"
                                                    :idx="idx"
                                                    :current-path="state.currentPath"
                                                    is-hide-favorite
                            />
                        </p-tooltip>
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
                <template #slot-namespace>
                    <p-data-loader :loading="storeState.namespaceMenuLoading"
                                   :loader-backdrop-opacity="0.5"
                                   :loader-backdrop-color="gray[100]"
                                   class="namespace-data-loader"
                    >
                        <l-s-b-menu-item :menu-data="state.namespaceTopTitleMenu"
                                         :current-path="state.currentPath"
                                         :depth="1"
                        />
                        <div class="namespace-wrapper">
                            <p-search class="namespace-search"
                                      :value="namespaceState.inputValue"
                                      @update:value="handleSearchNamespace"
                            />
                            <l-s-b-collapsible-menu-item v-for="(item, idx) in namespaceState.namespaceLSBItems"
                                                         v-show="!namespaceState.inputValue"
                                                         :key="`namespace-${idx}`"
                                                         class="category-menu-item"
                                                         :item="item"
                                                         is-sub-item
                                                         :override-collapsed="item.initialCollapsed"
                                                         @change-collapesd="handleToggleNamespaceGroup"
                            >
                                <template #left-image>
                                    <p-lazy-img class="title-image"
                                                :src="item.icon"
                                                width="1rem"
                                                height="1rem"
                                    />
                                </template>
                                <template #collapsible-contents="{ item: _item }">
                                    <p-data-loader :loading="storeState.namespaceLoadingMap[item.id]"
                                                   :loader-backdrop-opacity="0.5"
                                                   :loader-backdrop-color="gray[100]"
                                    >
                                        <div v-for="(_menu, _idx) in _item.subItems"
                                             :key="`${_menu.label}-${_idx}`"
                                             :class="{'namespace-menu-item': true, 'selected': isSelectedNamespace(_menu) }"
                                             @click="handleClickNamespace(_menu)"
                                        >
                                            <span class="text">
                                                {{ _menu?.label || '' }}
                                            </span>
                                        </div>
                                    </p-data-loader>
                                </template>
                            </l-s-b-collapsible-menu-item>
                            <l-s-b-collapsible-menu-item v-for="(item, idx) in namespaceState.namespaceLSBItemsByKeywordSearch"
                                                         v-show="namespaceState.inputValue"
                                                         :key="`namespace-search-${idx}`"
                                                         class="category-menu-item category-menu-item-by-keyword"
                                                         :item="item"
                                                         is-sub-item
                                                         :override-collapsed="item.initialCollapsed"
                            >
                                <template #left-image>
                                    <p-lazy-img class="title-image"
                                                :src="item.icon"
                                                width="1rem"
                                                height="1rem"
                                    />
                                </template>
                                <template #collapsible-contents="{ item: _item }">
                                    <div v-for="(_menu, _idx) in _item.subItems"
                                         :key="`${_menu.label}-${_idx}`"
                                         :class="{'namespace-menu-item': true, 'selected': isSelectedNamespace(_menu) }"
                                         @click="handleClickNamespace(_menu)"
                                    >
                                        <p-text-highlighting class="text"
                                                             :term="namespaceState.inputValue"
                                                             :text="_menu?.label || ''"
                                        />
                                    </div>
                                </template>
                            </l-s-b-collapsible-menu-item>
                            <p-empty v-if="namespaceState.inputValue && !namespaceState.namespaceLSBItemsByKeywordSearch.length"
                                     class="keyword-search-empty"
                            >
                                <span>
                                    {{ $t('INVENTORY.METRIC_EXPLORER.EMPTY_TEXT') }}
                                </span>
                            </p-empty>
                        </div>
                    </p-data-loader>
                </template>
                <template #slot-metric>
                    <metric-explorer-l-s-b-metric :is-detail-page="state.isDetailPage" />
                </template>
            </l-s-b>

            <template #content>
                <div class="metric-select-guide-content">
                    <p class="title">
                        {{ $t('INVENTORY.METRIC_EXPLORER.SELECT_METRIC_GUIDE.TITLE') }}
                    </p>
                    <span class="description">
                        {{ $t('INVENTORY.METRIC_EXPLORER.SELECT_METRIC_GUIDE.DESCRIPTION') }}
                    </span>
                    <div class="button-wrapper">
                        <p-checkbox v-model="guidePopoverState.noMore">
                            {{ $t('INVENTORY.METRIC_EXPLORER.SELECT_METRIC_GUIDE.DONT_SHOW_ME_AGAIN') }}
                        </p-checkbox>
                        <p-button style-type="substitutive"
                                  @click="handleConfirmMetricGuide"
                        >
                            {{ $t('INVENTORY.METRIC_EXPLORER.SELECT_METRIC_GUIDE.CONFIRM') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-popover>
    </div>
</template>

<style scoped lang="postcss">
.metric-explorer-l-s-b {
    .namespace-data-loader {
        min-height: 15rem;

        .back-to-home-button {
            height: 1.6875rem;
        }
        .namespace-wrapper {
            @apply flex flex-col;
            gap: 0.5rem;

            .category-menu-item {
                padding: 0 0.25rem;
                .title-image {
                    width: 1rem;
                    height: 1rem;
                    min-width: 1rem;
                }
                .namespace-menu-item {
                    @apply inline-flex items-center w-full text-gray-800;
                    height: 2rem;
                    padding: 0 0.5rem;
                    border-radius: 0.25rem;
                    &.selected {
                        @apply bg-blue-200;
                    }

                    &:hover {
                        @apply bg-blue-100 cursor-pointer;
                    }
                    .text {
                        @apply text-label-md overflow-hidden whitespace-nowrap;
                        text-overflow: ellipsis;
                    }
                }
            }
        }
    }
    .no-data {
        @apply flex text-gray-500;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.125rem;
    }
    .keyword-search-empty {
        @apply text-paragraph-md;
        margin-top: 1.25rem;
        white-space: pre;
    }
}

.metric-select-guide-popover {
    top: 12rem;

    .metric-select-guide-content {
        padding: 0.75rem 0.5rem;
        width: 21.5rem;
        height: 9rem;

        .title {
            @apply text-label-md font-bold text-gray-900;
            margin-bottom: 0.5rem;
        }
        .description {
            @apply text-paragraph-md text-gray-900;
            white-space: pre-line;
        }
        .button-wrapper {
            @apply flex justify-between items-center;
            padding-top: 1.25rem;
        }
    }
}

</style>
