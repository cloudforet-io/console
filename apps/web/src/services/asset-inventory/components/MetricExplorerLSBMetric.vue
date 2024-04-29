<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PDataLoader, PIconButton, PLazyImg, PSearch, PEmpty, PTooltip,
} from '@spaceone/design-system';
import type { TreeDisplayMap, TreeNode } from '@spaceone/design-system/src/data-display/tree/tree-view/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type {
    CloudServiceTypeItem,
    CloudServiceTypeReferenceMap,
} from '@/store/reference/cloud-service-type-reference-store';
import type { MetricReferenceItem, MetricReferenceMap } from '@/store/reference/metric-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import MetricExplorerLSBMetricTree from '@/services/asset-inventory/components/MetricExplorerLSBMetricTree.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { NamespaceSubItemType } from '@/services/asset-inventory/types/metric-explorer-type';


interface Props {
    selectedNamespace?: NamespaceSubItemType;
    isDetailPage?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:selected-namespace', value: NamespaceSubItemType|undefined): void;}>();

const allReferenceStore = useAllReferenceStore();
const metricExplorerPageStore = useMetricExplorerPageStore();
const route = useRoute();


const storeState = reactive({
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => allReferenceStore.getters.cloudServiceType),
    cloudServiceTypeToItemMap: computed(() => {
        const res: Record<string, CloudServiceTypeItem> = {};
        Object.entries(storeState.cloudServiceTypes).forEach(([, item]) => {
            res[`${item.data.provider}:${item.data.group}:${item.name}`] = item;
        });
        return res;
    }),

});
const state = reactive({
    proxySelectedNamespace: useProxyValue('selectedNamespace', props, emit),
    selectedId: computed<string|undefined>(() => {
        if (!props.isDetailPage) return undefined;
        if (route.name === ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME) return route.params.metricId;
        return route.params.metricExampleId;
    }),
    inputValue: '',
    metrics: computed<MetricReferenceItem[]>(() => Object.values(storeState.metrics).filter((metric) => metric.data.namespace_id === state.proxySelectedNamespace?.name)),
    metricItems: computed<TreeNode[]>(() => state.metrics.map((metric) => {
        const metricTreeNode = {
            id: metric.key,
            depth: 0,
            data: {
                ...metric,
                type: 'metric',
                is_managed: metric.data.is_managed,
                to: {
                    name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                    params: {
                        metricId: metric.key,
                    },
                },
            },
        };
        const examples = state.metricExamples.filter((example) => example.metric_id === metric.key);
        if (examples.length) {
            return {
                ...metricTreeNode,
                children: examples.map((example) => ({
                    id: example.example_id,
                    depth: 1,
                    data: {
                        ...example,
                        type: 'example',
                        to: {
                            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
                            params: {
                                metricId: metric.key,
                                metricExampleId: example.example_id,
                            },
                        },
                    },
                })),
            };
        }
        return metricTreeNode;
    })),
    metricItemsFilterByInput: computed(() => {
        const keyword = state.inputValue.toLowerCase();
        return state.metricItems.filter((metric) => metric.data.name.toLowerCase().includes(keyword) || metric.children?.some((example) => example.data.name.toLowerCase().includes(keyword)));
    }),
    metricExamples: computed(() => metricExplorerPageStore.state.metricExamples),
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
});

/* Util */
const getNamespaceImageUrl = (namespace: NamespaceSubItemType): string|undefined => {
    const provider = namespace.provider;
    const formattedCloudServiceName = namespace.label.replace('/', ':');

    if (provider) {
        const key = `${provider}:${formattedCloudServiceName}`;
        const icon = storeState.cloudServiceTypeToItemMap[key]?.icon;
        if (icon) return assetUrlConverter(icon);
    }
    return undefined;
};

/* Event */
const handleClickBackToNamespace = () => {
    state.proxySelectedNamespace = undefined;
};
const handleOpenAddCustomMetricModal = () => {
    metricExplorerPageStore.openMetricQueryFormSidebar('CREATE');
};
const handleSearchMetricAndExample = (keyword: string) => {
    state.inputValue = keyword;
};

onMounted(() => {
    if (route.params.metricExampleId) {
        state.metricTreeDisplayMap = {
            [route.params.metricId]: {
                isOpen: true,
            },
        };
    }
});

</script>

<template>
    <p-data-loader :loading="false"
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
                                :src="getNamespaceImageUrl(state.proxySelectedNamespace)"
                                width="1.25rem"
                                height="1.25rem"
                    />
                    <p-tooltip class="title"
                               :contents="state.proxySelectedNamespace?.label || ''"
                    >
                        <span>{{ state.proxySelectedNamespace?.label.split('/')[0] }}</span>
                        <span class="divider">/</span>
                        <span class="type">{{ state.proxySelectedNamespace?.label.split('/')[1] }}</span>
                    </p-tooltip>
                </div>
                <p-icon-button style-type="tertiary"
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
