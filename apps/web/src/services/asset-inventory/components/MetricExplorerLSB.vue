<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEmpty, startCase, toLower } from 'lodash';

import {
    PI, PSearch, PTextHighlighting, PDataLoader, PEmpty, PPopover, PButton, PCheckbox, PTooltip, PLazyImg,
} from '@cloudforet/mirinae';

import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceMap, MetricReferenceItem } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceItem, NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';

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
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { NamespaceSubItemType } from '@/services/asset-inventory/types/asset-analysis-type';

const lsbRef = ref<HTMLElement|null>(null);
const { width: lsbWidth } = useElementSize(lsbRef);

const route = useRoute();

const assetInventorySettingsStore = useAssetInventorySettingsStore();
const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;

const storeState = reactive({
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    metricExamples: computed<MetricExampleModel[]>(() => gnbGetters.metricExamples),
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
    providers: computed(() => allReferenceStore.getters.provider),
    favoriteItems: computed(() => [
        ...favoriteGetters.metricItems,
        ...favoriteGetters.metricExampleItems,
    ]),
    selectedNamespace: computed(() => metricExplorerPageState.selectedNamespace),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

const state = reactive({
    loading: false,
    currentPath: computed(() => route.fullPath),
    currentMetricIdByUrl: computed(() => route.params.metricId),
    isDetailPage: computed(() => !!state.currentMetricIdByUrl),
    currentMetrics: computed<MetricReferenceItem[]>(() => Object.values(storeState.metrics).filter((metric) => metric.data.namespace_id === storeState.selectedNamespace?.name)),
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
        if (!metricExplorerPageState.selectedNamespace) return [...baseMenuSet, state.namespaceMenu];
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
            to: {
                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                params: {
                    metricId: metric.key,
                },
            },
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
            to: {
                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
                params: {
                    metricId: example.metric_id,
                    metricExampleId: example.example_id,
                },
            },
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
    collapsed: true,
    selectedMetric: computed<MetricReferenceItem|undefined>(() => (state.isDetailPage ? storeState.metrics[state.currentMetricIdByUrl] : undefined)),
    namespaces: computed<NamespaceReferenceItem[]>(() => Object.values(storeState.namespaces)),
    namespacesFilteredByInput: computed(() => {
        const keyword = namespaceState.inputValue.toLowerCase();
        if (!keyword) return namespaceState.namespaces;
        return namespaceState.namespaces.filter((namespace) => namespace.name.toLowerCase().includes(keyword));
    }),
    namespaceItems: computed<LSBCollapsibleItem<NamespaceSubItemType>[]>(() => {
        if (isEmpty(storeState.providers)) return [];
        return [
            ...convertCommonNamespaceToLSBCollapsibleItems(namespaceState.namespaces),
            ...convertNamespaceToLSBCollapsibleItems(namespaceState.namespaces),
        ];
    }),
    namespaceItemsByKeyword: computed<LSBCollapsibleItem<NamespaceSubItemType>[]>(() => {
        if (isEmpty(storeState.providers)) return [];
        return [
            ...convertCommonNamespaceToLSBCollapsibleItems(namespaceState.namespacesFilteredByInput),
            ...convertNamespaceToLSBCollapsibleItems(namespaceState.namespacesFilteredByInput),
        ];
    }),
});

const guidePopoverState = reactive({
    metricGuideVisible: false,
    noMore: false,
});


/* Helper */
const convertCommonNamespaceToLSBCollapsibleItems = (namespaces: NamespaceReferenceItem[]): LSBCollapsibleItem<NamespaceSubItemType>[] => {
    const commonNamespaces = namespaces.filter((namespace) => namespace.data.group === 'common').map((namespace) => ({
        label: namespace.name,
        name: namespace.key,
        category: namespace.data.category,
        group: namespace.data.group || 'common',
        resourceType: namespace.data.resource_type,
        icon: 'COMMON',
    }));
    if (commonNamespaces.length === 0) return [];
    return [{
        type: MENU_ITEM_TYPE.COLLAPSIBLE,
        label: i18n.t('INVENTORY.METRIC_EXPLORER.COMMON'),
        icon: 'COMMON',
        subItems: commonNamespaces,
    }];
};
const convertNamespaceToLSBCollapsibleItems = (namespaces: NamespaceReferenceItem[]): LSBCollapsibleItem<NamespaceSubItemType>[] => {
    const namespaceMap = {};
    namespaces.filter((namespace) => namespace.data.group !== 'common').forEach((namespace) => {
        const group = namespace.data.group || '';
        const providerData = storeState.providers[group];
        if (namespaceMap[group]) {
            namespaceMap[group].subItems.push({
                label: namespace.name,
                name: namespace.key,
                group: namespace.data.group,
                category: namespace.data.category,
                icon: namespace.data.icon,
            });
        } else {
            const label = providerData ? providerData.label : customSnakeToTitleCase(group);
            const icon = providerData ? providerData.icon : undefined;
            namespaceMap[group] = {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label,
                icon,
                initialCollapsed: true,
                subItems: [{
                    label: namespace.name,
                    name: namespace.key,
                    group: namespace.data.group,
                    category: namespace.data.category,
                    icon: namespace.data.icon,
                }],
            };
        }
    });
    return Object.values(namespaceMap);
};
const isSelectedNamespace = (namespace: NamespaceSubItemType): boolean => {
    if (!storeState.selectedNamespace) return false;
    return storeState.selectedNamespace.name === namespace.name
        && storeState.selectedNamespace.group === namespace.group;
};

const customSnakeToTitleCase = (title: string) => startCase(toLower(title.replace(/_/g, ' ')));

/* Event */
const handleSearchNamespace = (keyword: string) => {
    if (keyword) namespaceState.collapsed = false; else namespaceState.collapsed = true;
    namespaceState.inputValue = keyword;
};
const handleClickNamespace = (namespace: NamespaceSubItemType) => {
    metricExplorerPageStore.setSelectedNamespace(namespace);
};
const handleConfirmMetricGuide = () => {
    if (guidePopoverState.noMore) {
        assetInventorySettingsStore.setNotShowMetricSelectGuidePopover(true);
    }
    guidePopoverState.metricGuideVisible = false;
    guidePopoverState.noMore = false;
};

watch(() => route.params, async () => {
    state.loading = true;
    await allReferenceStore.load('metric');
    if (state.currentMetricIdByUrl) {
        const targetNamespace = namespaceState.namespaces.find((item) => item.key === namespaceState.selectedMetric?.data.namespace_id);
        metricExplorerPageStore.setSelectedNamespace({
            label: targetNamespace?.name,
            name: namespaceState.selectedMetric?.data.namespace_id,
            group: targetNamespace?.data.group,
            category: targetNamespace.data.category,
            icon: targetNamespace.data.group === 'common' ? 'COMMON' : targetNamespace.data.icon,
            resourceType: targetNamespace.data.resource_type,
        });
    } else metricExplorerPageStore.setSelectedNamespace(undefined);
    state.loading = false;
}, { immediate: true });

// Whether to show metric-select-guide popover
watch(() => storeState.selectedNamespace, (selectedNamespace) => {
    if (selectedNamespace
        && state.isDetailPage
        && !state.currentMetrics.map((metric) => metric.key).includes(state.currentMetricIdByUrl)
        && !assetInventorySettingsStore.getNotShowMetricSelectGuidePopover
    ) {
        guidePopoverState.metricGuideVisible = true;
    } else guidePopoverState.metricGuideVisible = false;
});

</script>

<template>
    <div class="metric-explorer-l-s-b">
        <p-popover class="metric-select-guide-popover"
                   :is-visible="guidePopoverState.metricGuideVisible"
                   position="right"
                   ignore-outside-click
                   ignore-target-click
                   boundary=".metric-explorer-l-s-b"
                   trigger="none"
                   :style="{ left: `${lsbWidth}px`}"
        >
            <l-s-b ref="lsbRef"
                   :menu-set="state.menuSet"
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
                    <p-data-loader :loading="state.loading"
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
                            <l-s-b-collapsible-menu-item v-for="(item, idx) in namespaceState.namespaceItems"
                                                         v-show="!namespaceState.inputValue"
                                                         :key="`namespace-${idx}`"
                                                         class="category-menu-item"
                                                         :item="item"
                                                         is-sub-item
                                                         :override-collapsed="item.initialCollapsed"
                            >
                                <template #left-image>
                                    <img v-if="item.icon === 'COMMON'"
                                         class="title-image"
                                         src="@/assets/images/img_common-asset@2x.png"
                                         alt="common-namespace-image"
                                    >
                                    <p-lazy-img v-else
                                                class="title-image"
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
                                        <span class="text">
                                            {{ _menu?.label || '' }}
                                        </span>
                                    </div>
                                </template>
                            </l-s-b-collapsible-menu-item>
                            <l-s-b-collapsible-menu-item v-for="(item, idx) in namespaceState.namespaceItemsByKeyword"
                                                         v-show="namespaceState.inputValue"
                                                         :key="`namespace-search-${idx}`"
                                                         class="category-menu-item category-menu-item-by-keyword"
                                                         :item="item"
                                                         is-sub-item
                                                         :override-collapsed="namespaceState.collapsed"
                            >
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
                            <p-empty v-if="namespaceState.inputValue && !namespaceState.namespaceItemsByKeyword.length"
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
                    <metric-explorer-l-s-b-metric :is-detail-page="state.isDetailPage"
                                                  :metrics="state.currentMetrics"
                    />
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
