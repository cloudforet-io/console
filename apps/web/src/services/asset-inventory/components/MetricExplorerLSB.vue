<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PI, PSearch, PTextHighlighting, PDataLoader, PTextButton, PEmpty,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';


import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceMap, MetricReferenceItem } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceItem, NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';

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

import { gray, yellow } from '@/styles/colors';

import MetricExplorerLSBMetric from '@/services/asset-inventory/components/MetricExplorerLSBMetric.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { NamespaceSubItemType } from '@/services/asset-inventory/types/metric-explorer-type';

const route = useRoute();
const router = useRouter();

const allReferenceStore = useAllReferenceStore();
const { getProperRouteLocation } = useProperRouteLocation();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;

const storeState = reactive({
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
    providers: computed(() => allReferenceStore.getters.provider),
    favoriteItems: computed(() => [
        ...favoriteGetters.metricItems,
        // ...favoriteGetters.metricExampleItems,
    ]),
});

const state = reactive({
    loading: false,
    currentPath: computed(() => route.fullPath),
    currentMetricIdByUrl: computed(() => route.params.metricId),
    isDetailPage: computed(() => !!state.currentMetricIdByUrl),
    menuSet: computed(() => {
        const baseMenuSet = [
            {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label: i18n.t('COMMON.STARRED'),
                id: 'starred',
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

        return [
            ...metricMenuList,
            // ...metricExampleList,
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
            ...convertAssetNamespaceToLSBCollapsibleItems(namespaceState.namespaces),
        ];
    }),
    namespaceItemsByKeyword: computed<LSBCollapsibleItem<NamespaceSubItemType>[]>(() => {
        if (isEmpty(storeState.providers)) return [];
        return [
            ...convertCommonNamespaceToLSBCollapsibleItems(namespaceState.namespacesFilteredByInput),
            ...convertAssetNamespaceToLSBCollapsibleItems(namespaceState.namespacesFilteredByInput),
        ];
    }),
    selectedNamespace: computed(() => metricExplorerPageState.selectedNamespace),
    currentMetric: computed<MetricReferenceItem|undefined>(() => (state.isDetailPage ? storeState.metrics[state.currentMetricIdByUrl] : undefined)),
});


/* Helper */
const convertCommonNamespaceToLSBCollapsibleItems = (namespaces: NamespaceReferenceItem[]): LSBCollapsibleItem<NamespaceSubItemType>[] => {
    const commonNamespaces = namespaces.filter((namespace) => namespace.data.category === 'COMMON').map((namespace) => ({
        label: namespace.name,
        name: namespace.key,
    }));
    if (commonNamespaces.length === 0) return [];
    return [{
        type: MENU_ITEM_TYPE.COLLAPSIBLE,
        label: i18n.t('INVENTORY.METRIC_EXPLORER.COMMON'),
        subItems: commonNamespaces,
    }];
};
const convertAssetNamespaceToLSBCollapsibleItems = (namespaces: NamespaceReferenceItem[]): LSBCollapsibleItem<NamespaceSubItemType>[] => {
    const namespaceMap = {};
    namespaces.filter((namespace) => namespace.data.category === 'ASSET').forEach((namespace) => {
        const providerData = storeState.providers[namespace.provider];
        if (namespaceMap[namespace.provider]) {
            namespaceMap[namespace.provider].subItems.push({
                label: namespace.name,
                name: namespace.key,
                provider: namespace.provider,
            });
        } else {
            namespaceMap[namespace.provider] = {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label: providerData.label,
                icon: providerData.icon,
                subItems: [{
                    label: namespace.name,
                    name: namespace.key,
                    provider: namespace.provider,
                }],
            };
        }
    });
    return Object.values(namespaceMap);
};
const isSelectedNamespace = (namespace: NamespaceSubItemType): boolean => {
    if (!namespaceState.selectedNamespace) return false;
    return namespaceState.selectedNamespace.name === namespace.name
        && namespaceState.selectedNamespace.provider === namespace.provider;
};

/* Event */
const handleSearchNamespace = (keyword: string) => {
    if (keyword) namespaceState.collapsed = false; else namespaceState.collapsed = true;
    namespaceState.inputValue = keyword;
};
const handleClickNamespace = (namespace: NamespaceSubItemType) => {
    metricExplorerPageStore.setSelectedNamespace(namespace);
};
const handleClickBackToHome = () => {
    router.push(getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER._NAME }));
};

watch(() => route.params, async () => {
    state.loading = true;
    await allReferenceStore.load('metric');
    if (state.currentMetricIdByUrl) {
        metricExplorerPageStore.setSelectedNamespace({
            label: namespaceState.namespaces.find((item) => item.key === namespaceState.currentMetric?.data.namespace_id)?.name,
            name: namespaceState.currentMetric.data.namespace_id,
        });
    } else metricExplorerPageStore.setSelectedNamespace(undefined);
    state.loading = false;
}, { immediate: true });

</script>

<template>
    <l-s-b class="metric-explorer-l-s-b"
           :menu-set="state.menuSet"
    >
        <template #collapsible-contents-starred>
            <div v-if="state.starredMenuSet.length > 0">
                <l-s-b-router-menu-item v-for="(item, idx) of state.starredMenuSet"
                                        :key="idx"
                                        :item="item"
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
        <template #slot-namespace>
            <p-data-loader :loading="state.loading"
                           :loader-backdrop-opacity="0.5"
                           :loader-backdrop-color="gray[100]"
                           class="namespace-data-loader"
            >
                <p-text-button v-if="state.isDetailPage"
                               class="back-to-home-button"
                               icon-left="ic_arrow-left"
                               size="sm"
                               @click="handleClickBackToHome"
                >
                    {{ $t('INVENTORY.METRIC_EXPLORER.METRIC_EXPLORER_HOME') }}
                </p-text-button>
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
                    >
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
            <metric-explorer-l-s-b-metric :is-detail-page="state.isDetailPage" />
        </template>
    </l-s-b>
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
                        @apply text-label-md overflow-hidden whitespace-no-wrap;
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
</style>
