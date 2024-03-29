<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PI, PLazyImg, PSearch, PIconButton, PTooltip, PTextHighlighting, PDataLoader,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';


import type { MetricModel } from '@/schema/inventory/metric/model';
import type { NamespaceModel } from '@/schema/inventory/namespace/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type {
    CloudServiceTypeItem,
    CloudServiceTypeReferenceMap,
} from '@/store/reference/cloud-service-type-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBCollapsibleMenuItem from '@/common/modules/navigations/lsb/modules/LSBCollapsibleMenuItem.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBMenu, LSBCollapsibleItem, LSBItem } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { gray, yellow } from '@/styles/colors';

import AddCustomMetricModal from '@/services/asset-inventory/components/AddCustomMetricModal.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


interface NamespaceSubItemType {
    label: string;
    name: string;
    provider?: string;
}

const route = useRoute();
const metricExplorerPageStore = useMetricExplorerPageStore();
const allReferenceStore = useAllReferenceStore();
const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    namespaceLoading: computed(() => metricExplorerPageStore.state.namespaceListloading),
    metricLoading: computed(() => metricExplorerPageStore.state.metricListLoading),
    providers: computed(() => allReferenceStore.getters.provider),
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
    currentPath: computed(() => route.fullPath),
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
        if (!namespaceState.selectedNamespace) return [...baseMenuSet, state.namespaceMenu];
        return [...baseMenuSet, state.metircMenu];
    }),
    starredMenuSet: computed<LSBMenu[]>(() => []),
    namespaceMenu: computed(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        label: i18n.t('COMMON.NAMESPACE'),
        id: 'namespace',
    })),
    metircMenu: computed(() => ({
        type: MENU_ITEM_TYPE.SLOT,
        id: 'metric',
    })),
});

const namespaceState = reactive({
    inputValue: '',
    collapsed: true,
    namespaces: computed<NamespaceModel[]>(() => metricExplorerPageStore.state.namespaces),
    namespacesFilteredByInput: computed(() => {
        const keyword = namespaceState.inputValue.toLowerCase();
        if (!keyword) return namespaceState.namespaces;
        return namespaceState.namespaces.filter((namespace) => namespace.name.toLowerCase().includes(keyword));
    }),
    namespaceItems: computed<LSBCollapsibleItem<NamespaceSubItemType>[]>(() => {
        if (isEmpty(storeState.providers)) return [];
        return [
            ...convertCommonNamespaceToLSBCollapsibleItems(namespaceState.namespacesFilteredByInput),
            ...convertAssetNamespaceToLSBCollapsibleItems(namespaceState.namespacesFilteredByInput),
        ];
    }),
    selectedNamespace: undefined as NamespaceSubItemType | undefined,
});

const metricState = reactive({
    inputValue: '',
    selectedMetric: undefined as any|undefined,
    metrics: computed<MetricModel[]>(() => metricExplorerPageStore.state.metricList),
    metricsFilteredByInput: computed(() => {
        const keyword = metricState.inputValue.toLowerCase();
        if (!keyword) return metricState.metrics;
        return metricState.metrics.filter((metric) => metric.name.toLowerCase().includes(keyword));
    }),
    metricItems: computed<LSBItem[]>(() => metricState.metricsFilteredByInput.map((metric) => ({
        type: MENU_ITEM_TYPE.ITEM,
        label: metric.name,
        id: metric.metric_id,
        to: getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: { id: metric.metric_id },
        }),
    }))),
    addCustomMetricModalVisible: false,
});

/* Helper */
const convertCommonNamespaceToLSBCollapsibleItems = (namespaces: NamespaceModel[]): LSBCollapsibleItem<NamespaceSubItemType>[] => {
    const commonNamespaces = namespaces.filter((namespace) => namespace.category === 'COMMON').map((namespace) => ({
        label: namespace.name,
        name: namespace.namespace_id,
    }));
    return [{
        type: MENU_ITEM_TYPE.COLLAPSIBLE,
        label: i18n.t('COMMON.COMMON'),
        subItems: commonNamespaces,
    }];
};
const convertAssetNamespaceToLSBCollapsibleItems = (namespaces: NamespaceModel[]): LSBCollapsibleItem<NamespaceSubItemType>[] => {
    const namespaceMap = {};
    namespaces.filter((namespace) => namespace.category === 'ASSET').forEach((namespace) => {
        const providerData = storeState.providers[namespace.provider];
        if (namespaceMap[namespace.provider]) {
            namespaceMap[namespace.provider].subItems.push({
                label: namespace.name,
                name: namespace.namespace_id,
                provider: namespace.provider,
            });
        } else {
            namespaceMap[namespace.provider] = {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label: providerData.label,
                icon: providerData.icon,
                subItems: [{
                    label: namespace.name,
                    name: namespace.namespace_id,
                    provider: namespace.provider,
                }],
            };
        }
    });
    return Object.values(namespaceMap);
};
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
const handleSearchMetric = (keyword: string) => {
    console.debug('handleSearchMetric', keyword);
    metricState.inputValue = keyword;
};
const handleClickNamespace = (namespace: NamespaceSubItemType) => {
    namespaceState.selectedNamespace = namespace;
};
const handleClickBackToNamespace = () => {
    namespaceState.selectedNamespace = undefined;
};
const handleOpenAddCustomMetricModal = () => {
    metricState.addCustomMetricModalVisible = true;
};

watch(() => namespaceState.selectedNamespace, (selectedNamespace) => {
    if (selectedNamespace) {
        metricExplorerPageStore.loadMetrics(selectedNamespace.name);
    }
});

onMounted(async () => {
    await metricExplorerPageStore.loadNamespaces();
});

</script>

<template>
    <fragment>
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
                <p-data-loader :loading="storeState.namespaceLoading"
                               :data="namespaceState.namespaces"
                               :min-loading-time="1000"
                               :loader-backdrop-opacity="0.5"
                               :loader-backdrop-color="gray[100]"
                               class="namespace-data-loader"
                >
                    <l-s-b-collapsible-menu-item :item="state.namespaceMenu">
                        <template #collapsible-contents>
                            <div class="namespace-wrapper">
                                <p-search class="namespace-search"
                                          :value="namespaceState.inputValue"
                                          @update:value="handleSearchNamespace"
                                />
                                <l-s-b-collapsible-menu-item v-for="(item, idx) in namespaceState.namespaceItems"
                                                             :key="`provider-${idx}`"
                                                             class="category-menu-item"
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
                            </div>
                        </template>
                    </l-s-b-collapsible-menu-item>
                </p-data-loader>
            </template>
            <template #slot-metric>
                <p-data-loader :loading="storeState.metricLoading"
                               :data="metricState.metrics"
                               :min-loading-time="1000"
                               :loader-backdrop-opacity="0.5"
                               :loader-backdrop-color="gray[100]"
                               class="metric-data-loader"
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
                                            :src="getNamespaceImageUrl(namespaceState.selectedNamespace)"
                                            width="1.25rem"
                                            height="1.25rem"
                                />
                                <p-tooltip class="title"
                                           :contents="namespaceState.selectedNamespace?.label || ''"
                                >
                                    <span>{{ namespaceState.selectedNamespace?.label.split('/')[0] }}</span>
                                    <span class="divider">/</span>
                                    <span class="type">{{ namespaceState.selectedNamespace?.label.split('/')[1] }}</span>
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
                                  :value="metricState.inputValue"
                                  @update:value="handleSearchMetric"
                        />
                        <l-s-b-router-menu-item v-for="(item, idx) in metricState.metricItems"
                                                :key="idx"
                                                :item="item"
                                                :idx="idx"
                                                :current-path="state.currentPath"
                        >
                            <template #text>
                                <p-text-highlighting class="text"
                                                     :term="metricState.inputValue"
                                                     :text="item?.label || ''"
                                />
                            </template>
                        </l-s-b-router-menu-item>
                    </div>
                </p-data-loader>
            </template>
        </l-s-b>
        <add-custom-metric-modal :visible.sync="metricState.addCustomMetricModalVisible" />
    </fragment>
</template>

<style scoped lang="postcss">
.metric-explorer-l-s-b {
    .namespace-data-loader {
        min-height: 15rem;
        .namespace-wrapper {
            @apply flex flex-col gap-1;

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
    .metric-data-loader {
        min-height: 15rem;

        .metric-wrapper {
            @apply w-full;

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
    }
    .no-data {
        @apply flex text-gray-500;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.125rem;
    }
}
</style>
