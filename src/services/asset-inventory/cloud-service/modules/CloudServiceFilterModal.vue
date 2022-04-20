<template>
    <p-button-modal
        v-if="visible"
        class="cloud-service-filter-modal"
        header-title="Set Filter"
        :visible.sync="proxyVisible"
        :footer-reset-button-visible="true"
        @confirm="handleFormConfirm"
        @return="handleClearAll"
    >
        <template #body>
            <div class="select-filter-body">
                <div class="left-select-filter-section">
                    <p-collapsible-list
                        class="collapsible-list-section"
                        :items="FILTER_ITEMS"
                        toggle-type="switch"
                        :multi-unfoldable="true"
                        :unfolded-indices.sync="unfoldedIndices"
                    >
                        <template #default="{name, isCollapsed}">
                            <cloud-service-filter-item v-if="!isCollapsed"
                                                       :type="name"
                                                       :selected.sync="proxyFilters[name]"
                                                       :provider="provider"
                            />
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="selected-filter-section">
                        <div class="title">
                            Selected filter ({{ selectedItemsLength }})
                        </div>
                        <div v-if="selectedItemsLength" class="selected-tags-wrapper">
                            <template v-for="([filterName, items], idx) in Object.entries(selectedItemsMap)">
                                <p-tag v-for="(item, itemIdx) in items" :key="`selected-tag-${idx}-${item.name}`"
                                       @delete="handleDeleteTag(filterName, itemIdx)"
                                >
                                    <b>{{ FILTER_LABELS[filterName] }}: </b>{{ item.label }}
                                </p-tag>
                            </template>
                        </div>
                        <div v-else class="no-item-wrapper">
                            <p>No selected filters</p>
                            <p>Select filters from the list.</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #reset-button>
            Clear All
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { sum } from 'lodash';

import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PCollapsibleList, PTag,
} from '@spaceone/design-system';

import { ReferenceItem } from '@/store/modules/reference/type';
import { store } from '@/store';
import { CloudServiceFilterKey } from '@/services/asset-inventory/cloud-service/type';
import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import CloudServiceFilterItem from '@/services/asset-inventory/cloud-service/modules/CloudServiceFilterItem.vue';
import { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import { RegionReferenceMap } from '@/store/modules/reference/region/type';
import { useProxyValue } from '@/common/composables/proxy-state';


interface FilterItem {
    name: string;
    title: string;
}

type CloudServiceFilterMap = Partial<Record<CloudServiceFilterKey, string[]>>
type CloudServiceFilterItemsMap = Partial<Record<CloudServiceFilterKey, FilterItem[]>>

const FILTER_LABELS: Record<CloudServiceFilterKey, string> = {
    [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: 'Service Category',
    [CLOUD_SERVICE_FILTER_KEY.REGION]: 'Region',
};

const FILTER_ITEMS: FilterItem[] = [
    { name: CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY, title: 'Service Category' },
    { name: CLOUD_SERVICE_FILTER_KEY.REGION, title: 'Region' },
];

interface Props {
    visible: boolean;
    filters: CloudServiceFilterMap;
}

export default defineComponent<Props>({
    name: 'CloudServiceFilterModal',
    components: {
        CloudServiceFilterItem,
        PButtonModal,
        PCollapsibleList,
        PTag,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        provider: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            referenceItemsMap: computed(() => ({
                provider: store.state.reference.provider.items as ProviderReferenceMap,
                region_code: store.state.reference.region.items as RegionReferenceMap,
            })),
            proxyFilters: useProxyValue('filters', props, emit),
            selectedItemsMap: computed<CloudServiceFilterItemsMap>(() => {
                const itemsMap: CloudServiceFilterItemsMap = {};

                Object.entries<string[]>(state.proxyFilters).forEach(([key, data]) => {
                    const items = state.referenceItemsMap[key];
                    if (items) {
                        itemsMap[key] = data?.map((d) => {
                            const item: ReferenceItem = items[d];
                            const label = key === 'region_code' ? item?.name : item?.label;
                            return { name: d, label: label ?? d };
                        });
                    } else itemsMap[key] = data?.map(d => ({ name: d, label: d }));
                });
                return itemsMap;
            }),
            selectedItemsLength: computed<number>(() => {
                const selectedValues = Object.values(state.selectedItemsMap);
                return sum(selectedValues.map(v => v?.length || 0));
            }),
            unfoldedIndices: [] as number[],
            menuLoading: false,
        });

        /* util */
        const init = () => {
            const _unfoldedIndices: number[] = [];
            FILTER_ITEMS.forEach((item, idx) => {
                if (props.filters[item.name]?.length) {
                    _unfoldedIndices.push(idx);
                }
            });
            state.unfoldedIndices = _unfoldedIndices;
            state.proxyFilters = { ...props.filters };
        };

        /* event */
        const handleDeleteTag = (filterName: string, itemIdx: number) => {
            const filters = { ...state.proxyFilters };
            const filterItems = [...filters[filterName]];
            filterItems.splice(itemIdx, 1);
            if (filterItems.length) {
                filters[filterName] = filterItems;
            } else {
                filters[filterName] = undefined;
            }
            state.proxyFilters = filters;
        };
        const handleFormConfirm = () => {
            emit('confirm', state.proxyFilters);
            state.proxyVisible = false;
        };
        const handleClearAll = () => {
            state.proxyFilters = {};
            state.unfoldedIndices = [];
        };

        watch(() => state.unfoldedIndices, (after, before) => {
            if (after.length < before.length) {
                const filters = { ...state.proxyFilters };
                const deletedIndex: number = before.filter(idx => !after.includes(idx))[0];
                const deletedFilterName = FILTER_ITEMS[deletedIndex].name;
                filters[deletedFilterName] = undefined;
                state.proxyFilters = filters;
            }
        });
        watch(() => props.visible, (after) => {
            if (after) init();
        });

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/region/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            handleFormConfirm,
            handleClearAll,
            handleDeleteTag,
            FILTER_LABELS,
            FILTER_ITEMS,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-filter-modal {
    &.p-button-modal::v-deep {
        .modal-content {
            height: 48.75rem;
        }
    }
    .select-filter-body {
        @apply grid grid-cols-2 gap-4;

        @screen mobile {
            @apply grid grid-cols-1;
        }

        .left-select-filter-section {
            @apply bg-gray-100 border border-solid border-gray-200 rounded;
            padding: 0.5rem;
            .collapsible-list-section {
                @apply flex flex-wrap flex-col gap-1;
                ::v-deep .collapsible-item {
                    @apply bg-white rounded-none;
                    padding: 0 1rem;
                    > .p-collapsible-panel {
                        > .contents {
                            @apply rounded-lg bg-blue-100;
                            padding: 0.75rem;
                            margin-top: 0.25rem;
                        }
                    }
                }
            }
        }
        .right-select-filter-section {
            @apply flex flex-col flex-wrap gap-4;

            .selected-filter-section {
                @apply rounded-lg border-gray-200 border-solid;
                min-height: 11rem;
                border-width: 1px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: flex-start;
                padding: 1rem;

                .selected-tags-wrapper .p-tag {
                    margin-bottom: 0.5rem;
                }
                .no-item-wrapper {
                    @apply text-gray-300;
                    font-size: 0.875rem;
                    line-height: 1.6;
                }
            }
        }
    }
}
</style>
