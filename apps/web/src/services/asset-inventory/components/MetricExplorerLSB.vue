<script setup lang="ts">

import { computed, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PI, PLazyImg, PSearch, PIconButton, PTooltip, PTextHighlighting, PDataLoader,
} from '@spaceone/design-system';


import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type {
    CloudServiceTypeItem,
    CloudServiceTypeReferenceMap,
} from '@/store/reference/cloud-service-type-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBCollapsibleMenuItem from '@/common/modules/navigations/lsb/modules/LSBCollapsibleMenuItem.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBMenu, LSBCollapsibleItem } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { gray, yellow } from '@/styles/colors';

import AddCustomMetricModal from '@/services/asset-inventory/components/AddCustomMetricModal.vue';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricNamespace } from '@/services/asset-inventory/types/metric-explorer-type';

interface NamespaceSubItemType {
    label: string;
    name: string;
    provider: string;
    cloudServiceGroup: string;
    cloudServiceType: string;
}

const route = useRoute();
const metricExplorerPageStore = useMetricExplorerPageStore();
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    loading: computed(() => metricExplorerPageStore.state.loading),
    providerItems: computed(() => allReferenceStore.getters.provider),
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
    namespaces: computed(() => metricExplorerPageStore.state.namespaces),
    namespacesFilteredByInput: computed(() => {
        const keyword = namespaceState.inputValue.toLowerCase();
        if (!keyword) return namespaceState.namespaces;
        return namespaceState.namespaces.filter((namespace) => {
            const providerData = storeState.providerItems[namespace.provider];
            return providerData.label.toLowerCase().includes(keyword)
                || `${namespace.cloud_service_group}/${namespace.cloud_service_type}`.toLowerCase().includes(keyword);
        });
    }),
    namespaceItems: computed<LSBCollapsibleItem<NamespaceSubItemType>[]>(() => [
        ...convertNamespaceToLSBCollapsibleItems(namespaceState.namespacesFilteredByInput),
    ]),
    selectedNamespace: undefined as NamespaceSubItemType | undefined,
});

const metricState = reactive({
    inputValue: '',
    selectedMetric: undefined as any|undefined,
    metricList: computed(() => []),
    addCustomMetricModalVisible: false,
});

/* Helper */
const convertNamespaceToLSBCollapsibleItems = (namespaces: MetricNamespace[]): LSBCollapsibleItem<NamespaceSubItemType>[] => {
    const namespaceMap = {};
    namespaces.forEach((namespace) => {
        const providerData = storeState.providerItems[namespace.provider];
        if (namespaceMap[namespace.provider]) {
            namespaceMap[namespace.provider].subItems.push({
                label: `${namespace.cloud_service_group}/${namespace.cloud_service_type}`,
                name: `${namespace.cloud_service_group}/${namespace.cloud_service_type}`,
                provider: namespace.provider,
                cloudServiceGroup: namespace.cloud_service_group,
                cloudServiceType: namespace.cloud_service_type,
            });
        } else {
            namespaceMap[namespace.provider] = {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label: providerData.label,
                icon: providerData.icon,
                subItems: [{
                    label: `${namespace.cloud_service_group}/${namespace.cloud_service_type}`,
                    name: `${namespace.cloud_service_group}/${namespace.cloud_service_type}`,
                    provider: namespace.provider,
                    cloudServiceGroup: namespace.cloud_service_group,
                    cloudServiceType: namespace.cloud_service_type,
                }],
            };
        }
    });
    return Object.values(namespaceMap);
};
const getNamespaceImageUrl = (namespace: NamespaceSubItemType): string|undefined => {
    const cloudServiceGroup = namespace.cloudServiceGroup;
    const cloudServiceType = namespace.cloudServiceType;
    const provider = namespace.provider;

    if (cloudServiceGroup && provider && cloudServiceType) {
        const key = `${provider}:${cloudServiceGroup}:${cloudServiceType}`;
        const icon = storeState.cloudServiceTypeToItemMap[key]?.icon;
        if (icon) return assetUrlConverter(icon);
    }
    return undefined;
};
const isSelectedNamespace = (namespace: NamespaceSubItemType): boolean => {
    if (!metricState.selectedMetric) return false;
    return metricState.selectedMetric.cloudServiceGroup === namespace.cloudServiceGroup
        && metricState.selectedMetric.cloudServiceType === namespace.cloudServiceType
        && metricState.selectedMetric.provider === namespace.provider;
};

/* Event */
const handleSearchNamespace = (keyword: string) => {
    console.debug('keyword', keyword);
    if (keyword) namespaceState.collapsed = false; else namespaceState.collapsed = true;
    namespaceState.inputValue = keyword;
};
const handleSearchMetric = (keyword: string) => {
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
                <p-data-loader :loading="storeState.loading"
                               :data="namespaceState.namespaces"
                               :min-loading-time="10000"
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
                <!--                TODO: active data-loader after API-->
                <p-data-loader :loading="false"
                               :data="namespaceState.selectedNamespace"
                               :min-loading-time="3000"
                               :loader-backdrop-opacity="0.5"
                               :loader-backdrop-color="gray[100]"
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
                                           :contents="`${namespaceState.selectedNamespace?.cloudServiceGroup} / ${namespaceState.selectedNamespace?.cloudServiceType}`"
                                >
                                    <span>{{ namespaceState.selectedNamespace?.cloudServiceGroup }}</span>
                                    <span class="divider">/</span>
                                    <span class="type">{{ namespaceState.selectedNamespace?.cloudServiceType }}</span>
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
                        <l-s-b-router-menu-item v-for="(item, idx) in metricState.metricList"
                                                :key="idx"
                                                :item="item"
                                                :idx="idx"
                                                :current-path="state.currentPath"
                        />
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
    .metric-wrapper {
        @apply w-full;

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
    .no-data {
        @apply flex text-gray-500;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.125rem;
    }
}
</style>
