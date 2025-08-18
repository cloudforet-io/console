<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import {
    PDataLoader, PIconButton, PLazyImg, PSearch, PEmpty, PTooltip,
} from '@cloudforet/mirinae';
import type { TreeDisplayMap, TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type {
    CloudServiceTypeItem,
    CloudServiceTypeReferenceMap,
} from '@/store/reference/cloud-service-type-reference-store';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { gray } from '@/styles/colors';

import MetricExplorerLSBMetricTree from '@/services/asset-inventory/components/MetricExplorerLSBMetricTree.vue';
import { useMetricExampleListQuery } from '@/services/asset-inventory/composables/use-metric-example-list-query';
import { useMetricListQuery } from '@/services/asset-inventory/composables/use-metric-list-query';
import { useNamespaceGetQuery } from '@/services/asset-inventory/composables/use-namespace-get-query';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


interface Props {
    isDetailPage?: boolean;
}

const props = defineProps<Props>();

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const authorizationStore = useAuthorizationStore();
const route = useRoute();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
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
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[state.selectedMenuId]?.write),
    selectedId: computed<string|undefined>(() => {
        const routeName = { name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME }.name;
        if (!props.isDetailPage) return undefined;
        if (route.name === routeName) return route.params.metricId;
        return route.params.metricExampleId;
    }),
    inputValue: '',
    metricItems: computed<TreeNode[]>(() => {
        const sortedMetrics = [
            ...namespaceMetrics.value?.filter((metric) => metric.metric_id.startsWith('metric-managed-')) ?? [],
            ...namespaceMetrics.value?.filter((metric) => !metric.metric_id.startsWith('metric-managed-')) ?? [],
        ];
        return sortedMetrics.map((metric) => {
            const metricTreeNode = {
                id: metric.metric_id,
                depth: 0,
                data: {
                    ...metric,
                    type: 'metric',
                    is_managed: metric.is_managed,
                    to: {
                        name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                        params: {
                            metricId: metric.metric_id,
                        },
                    },
                },
            };
            const examples = metricExamples.value?.filter((example) => example.metric_id === metric.metric_id) ?? [];
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
                                    metricId: metric.metric_id,
                                    metricExampleId: example.example_id,
                                },
                            },
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
});
const isLsbMetricLoading = computed<boolean>(() => namespaceMetricsLoading.value || metricExamplesLoading.value);

/* Query */
const { data: namespaceMetrics, isLoading: namespaceMetricsLoading } = useMetricListQuery({
    enabled: computed(() => !!metricExplorerPageState.selectedNamespaceId),
    params: computed(() => ({
        namespace_id: metricExplorerPageState.selectedNamespaceId,
    })),
});
const { data: metricExamples, isLoading: metricExamplesLoading } = useMetricExampleListQuery({
    params: computed(() => ({
        namespace_id: metricExplorerPageState.selectedNamespaceId,
    })),
});
const { data: currentNamespace, namespaceIcon } = useNamespaceGetQuery({
    namespaceId: computed(() => metricExplorerPageState.selectedNamespaceId || ''),
});


/* Event */
const handleClickBackToNamespace = () => {
    metricExplorerPageStore.setSelectedNamespaceId(undefined);
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
</script>

<template>
    <p-data-loader :loading="isLsbMetricLoading"
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
                    <img v-if="currentNamespace?.group === 'common'"
                         class="namespace-image"
                         src="@/assets/images/img_common-asset@2x.png"
                         alt="common-namespace-image"
                    >
                    <p-lazy-img v-else
                                class="namespace-image"
                                :src="namespaceIcon"
                                width="1.25rem"
                                height="1.25rem"
                    />
                    <p-tooltip class="title"
                               :contents="currentNamespace?.name || ''"
                    >
                        <span>{{ currentNamespace?.name.split('/')[0] }}</span>
                        <span class="divider">/</span>
                        <span class="type">{{ currentNamespace?.name.split('/')[1] }}</span>
                    </p-tooltip>
                </div>
                <p-icon-button v-if="state.hasReadWriteAccess && currentNamespace?.group !== 'common'"
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
