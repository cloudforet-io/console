<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PDataLoader, PIconButton, PLazyImg, PSearch, PEmpty, PTooltip,
} from '@cloudforet/mirinae';
import type { TreeDisplayMap, TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import type { NamespaceModel } from '@/schema/inventory-v2/namespace/model';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricModel } from '@/schema/inventory/metric/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type {
    CloudServiceTypeItem,
    CloudServiceTypeReferenceMap,
} from '@/store/reference/cloud-service-type-reference-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { gray } from '@/styles/colors';

import MetricExplorerLSBMetricTree from '@/services/asset-inventory/components/MetricExplorerLSBMetricTree.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerLSBStore } from '@/services/asset-inventory/stores/metric-explorer-l-s-b-store';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';

interface Props {
    isDetailPage?: boolean;
}

const props = defineProps<Props>();

const allReferenceStore = useAllReferenceStore();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerLSBStore = useMetricExplorerLSBStore();
const metricExplorerLSBState = metricExplorerLSBStore.state;

const { getProperRouteLocation } = useProperRouteLocation();
const { hasReadWriteAccess } = usePageEditableStatus();

const route = useRoute();

const storeState = reactive({
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => allReferenceStore.getters.cloudServiceType),
    cloudServiceTypeToItemMap: computed(() => {
        const res: Record<string, CloudServiceTypeItem> = {};
        Object.entries(storeState.cloudServiceTypes).forEach(([, item]) => {
            res[`${item.data.provider}:${item.data.group}:${item.name}`] = item;
        });
        return res;
    }),
    currentNamespace: computed<NamespaceModel|undefined>(() => metricExplorerLSBState.currentNamespace),
    metricList: computed<MetricModel[]>(() => metricExplorerLSBState.metricList),
    metricExampleList: computed<MetricExampleModel[]>(() => metricExplorerLSBState.metricExampleList),
});
const state = reactive({
    selectedId: computed<string|undefined>(() => {
        const routeName = getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME }).name;
        if (!props.isDetailPage) return undefined;
        if (route.name === routeName) return route.params.metricId;
        return route.params.metricExampleId;
    }),
    inputValue: '',
    metricItems: computed<TreeNode[]>(() => {
        const sortedMetrics: MetricModel[] = [
            ...storeState.metricList.filter((metric) => metric.is_managed),
            ...storeState.metricList.filter((metric) => !metric.is_managed),
        ];
        return sortedMetrics.map((metric) => {
            const metricTreeNode = {
                id: metric.metric_id,
                depth: 0,
                data: {
                    ...metric,
                    type: 'metric',
                    to: getProperRouteLocation({
                        name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                        params: {
                            metricId: metric.metric_id,
                        },
                    }),
                },
            };
            const examples: MetricExampleModel[] = storeState.metricExampleList.filter((example) => example.metric_id === metric.metric_id);
            if (examples.length) {
                return {
                    ...metricTreeNode,
                    children: examples.map((example) => ({
                        id: example.example_id,
                        depth: 1,
                        data: {
                            ...example,
                            type: 'example',
                            to: getProperRouteLocation({
                                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
                                params: {
                                    metricId: metric.metric_id,
                                    metricExampleId: example.example_id,
                                },
                            }),
                        },
                    })),
                };
            }
            return metricTreeNode;
        });
    }),
    metricItemsFilterByInput: computed(() => {
        const keyword = state.inputValue.toLowerCase();
        return state.metricItems.filter((metric) => metric.data.name.toLowerCase().includes(keyword) || metric.children?.some((example) => example.data.name.toLowerCase().includes(keyword)));
    }),
    metricTreeDisplayMap: undefined,
    metricTreeDisplayMapWithSearchKeyword: computed<TreeDisplayMap|undefined>(() => {
        if (!state.inputValue) return undefined;
        const displayMap: TreeDisplayMap = {};
        state.metricItems.forEach((metric) => {
            displayMap[metric.id] = {
                isOpen: true,
            };
        });
        return displayMap;
    }),
    metricLSBLoading: false,
});

/* Event */
const handleClickBackToNamespace = () => {
    metricExplorerLSBStore.setSelectedNamespaceId(undefined);
};
const handleOpenAddCustomMetricModal = () => {
    metricExplorerPageStore.openMetricQueryFormSidebar('CREATE');
};
const handleSearchMetricAndExample = (keyword: string) => {
    state.inputValue = keyword;
};

watch(() => route.params, () => {
    if (route.params.metricExampleId) {
        state.metricTreeDisplayMap = {
            [route.params.metricId]: {
                isOpen: true,
            },
        };
    }
}, { immediate: true });

/* Watcher */
watch(() => metricExplorerLSBState.selectedNamespaceId, async (selectedNamespaceId) => {
    if (selectedNamespaceId) {
        state.metricLSBLoading = true;
        await Promise.allSettled([
            await metricExplorerLSBStore.loadNamespace(selectedNamespaceId),
            await metricExplorerLSBStore.loadMetricList(selectedNamespaceId),
            await metricExplorerLSBStore.loadMetricExampleList(selectedNamespaceId),
        ]);
        state.metricLSBLoading = false;
    }
}, { immediate: true });
</script>

<template>
    <p-data-loader :loading="state.metricLSBLoading"
                   :loader-backdrop-opacity="0.5"
                   :loader-backdrop-color="gray[100]"
                   class="metric-explorer-l-s-b-metric-menu"
    >
        <div class="metric-wrapper">
            <div class="metric-title-item">
                <div class="title-wrapper">
                    <p-icon-button class="back-button"
                                   name="ic_arrow-left"
                                   size="sm"
                                   @click="handleClickBackToNamespace"
                    />
                    <p-lazy-img class="namespace-image"
                                :src="storeState.currentNamespace?.icon"
                                width="1.25rem"
                                height="1.25rem"
                    />
                    <p-tooltip class="title"
                               :contents="storeState.currentNamespace?.name || ''"
                    >
                        <span>{{ storeState.currentNamespace?.name }}</span>
                        <!--                        TODO: Check namespace naming convention-->
                        <!--                        <span>{{ storeState.currentNamespace?.name.split('/')[0] }}</span>-->
                        <!--                        <span class="divider">/</span>-->
                        <!--                        <span class="type">{{ storeState.currentNamespace?.name.split('/')[1] }}</span>-->
                    </p-tooltip>
                </div>
                <p-icon-button v-if="hasReadWriteAccess"
                               style-type="tertiary"
                               name="ic_plus"
                               shape="square"
                               size="sm"
                               @click="handleOpenAddCustomMetricModal"
                />
            </div>
            <p-search class="metric-search"
                      :value="state.inputValue"
                      @update:value="handleSearchMetricAndExample"
            />
            <metric-explorer-l-s-b-metric-tree v-show="!state.inputValue"
                                               class="base-metric-tree-menu"
                                               :metric-items="state.metricItems"
                                               :tree-display-map="state.metricTreeDisplayMap"
                                               :selected-id="state.selectedId"
            />
            <metric-explorer-l-s-b-metric-tree v-if="state.inputValue"
                                               class="search-metric-tree-menu"
                                               :metric-items="state.metricItemsFilterByInput"
                                               :tree-display-map="state.metricTreeDisplayMapWithSearchKeyword"
                                               :selected-id="state.selectedId"
                                               :keyword="state.inputValue"
            />
            <p-empty v-if="state.inputValue && !state.metricItemsFilterByInput.length"
                     class="keyword-search-empty"
            >
                <span>
                    {{ $t('INVENTORY.METRIC_EXPLORER.EMPTY_TEXT') }}
                </span>
            </p-empty>
            <p-empty v-else-if="!state.inputValue && !state.metricItems.length"
                     class="keyword-search-empty"
            >
                <span>
                    {{ $t('INVENTORY.METRIC_EXPLORER.NO_ITEMS') }}
                </span>
            </p-empty>
        </div>
    </p-data-loader>
</template>

<style scoped lang="postcss">
.metric-explorer-l-s-b-metric-menu {
    min-height: 15rem;

    .metric-wrapper {
        @apply flex flex-col;

        .metric-search {
            margin-bottom: 0.25rem;
        }

        .metric-title-item {
            @apply flex items-center justify-between w-full;
            margin-bottom: 0.5rem;

            .title-wrapper {
                @apply inline-flex items-center gap-1 truncate;
                width: calc(100% - 2rem);

                .namespace-image {
                    width: 1.25rem;
                    height: 1.25rem;
                    min-width: 1.25rem;
                }

                .title {
                    @apply text-label-md truncate;

                    .divider {
                        @apply text-gray-500;
                        margin: 0 0.125rem;
                    }

                    .type {
                        @apply font-bold;
                    }
                }
            }
        }
    }
    .keyword-search-empty {
        @apply text-paragraph-md;
        margin-top: 1.25rem;
        white-space: pre;
    }
}

</style>
