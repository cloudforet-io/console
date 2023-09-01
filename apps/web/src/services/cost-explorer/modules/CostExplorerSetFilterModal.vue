<script lang="ts" setup>
import {
    PButtonModal, PCollapsibleList,
} from '@spaceone/design-system';
import { sum } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { useProxyValue } from '@/common/composables/proxy-state';

import { FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import CostExplorerFilterItem from '@/services/cost-explorer/modules/CostExplorerFilterItem.vue';
import CostExplorerFilterTags from '@/services/cost-explorer/modules/CostExplorerFilterTags.vue';
import type { CostFiltersMap, Filter, FilterItem } from '@/services/cost-explorer/type';

interface Props {
    visible: boolean;
    categories: Filter[];
    prevSelectedFilters: CostFiltersMap;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    categories: () => ([]),
    prevSelectedFilters: () => ({}),
});
const emit = defineEmits<{(e: 'update:visible', value: boolean):void;
    (e: 'confirm', value: CostFiltersMap): void;
}>();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    selectedFilters: {} as CostFiltersMap,
    categoryItems: computed(() => props.categories.map((category) => ({
        name: FILTER_ITEM_MAP[category].name, title: FILTER_ITEM_MAP[category].label,
    }))),
    selectedItemsLength: computed<number>(() => {
        const selectedValues = Object.values(state.selectedFilters);
        return sum(selectedValues.map((v) => v?.length || 0));
    }),
    unfoldedIndices: [] as number[],
});

/* util */
const init = () => {
    const _unfoldedIndices: number[] = [];
    props.categories.forEach((category, idx) => {
        if (props.prevSelectedFilters[category]?.length) {
            _unfoldedIndices.push(idx);
        }
    });
    state.unfoldedIndices = _unfoldedIndices;
    state.selectedFilters = { ...props.prevSelectedFilters };
};

/* event */
const handleFormConfirm = () => {
    emit('confirm', state.selectedFilters);
    state.proxyVisible = false;
};
const handleClearAll = () => {
    state.selectedFilters = {};
    state.unfoldedIndices = [];
};

const handleUpdateFilterItems = (category: string, filterItems: FilterItem[]) => {
    state.selectedFilters = { ...state.selectedFilters, [category]: filterItems };
};
const handleUpdateFilterTags = (filters: CostFiltersMap) => {
    state.selectedFilters = filters;
};

watch(() => state.unfoldedIndices, (after, before) => {
    if (after.length < before.length) {
        const _filters = { ...state.selectedFilters };
        const deletedIndex: number = before.filter((idx) => !after.includes(idx))[0];
        const deletedFilterName = props.categories[deletedIndex];
        delete _filters[deletedFilterName];
        state.selectedFilters = _filters;
    }
});
watch(() => props.visible, (after) => {
    if (after) init();
});

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
        store.dispatch('reference/serviceAccount/load'),
        store.dispatch('reference/provider/load'),
        store.dispatch('reference/region/load'),
    ]);
})();

</script>

<template>
    <p-button-modal
        v-if="visible"
        v-model:visible="state.proxyVisible"
        class="cost-explorer-set-filter-modal"
        :header-title="t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SET_FILTERS')"
        :footer-reset-button-visible="true"
        @confirm="handleFormConfirm"
        @return="handleClearAll"
    >
        <template #body>
            <div class="select-filter-body">
                <div class="left-select-filter-section">
                    <p-collapsible-list
                        v-model:unfolded-indices="state.unfoldedIndices"
                        class="collapsible-list-section"
                        :items="state.categoryItems"
                        toggle-type="switch"
                        :multi-unfoldable="true"
                    >
                        <template #default="{name, isCollapsed}">
                            <cost-explorer-filter-item
                                v-if="!isCollapsed"
                                :category="name"
                                :selected-filter-items="state.selectedFilters[name]"
                                @update-filter-items="handleUpdateFilterItems(name, $event)"
                            />
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="selected-filter-section">
                        <div class="title">
                            {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECTED_FILTERS') }} ({{ state.selectedItemsLength }})
                        </div>
                        <cost-explorer-filter-tags :filters="state.selectedFilters"
                                                   deletable
                                                   @update-filter-tags="handleUpdateFilterTags"
                        >
                            <template #no-filter>
                                <div class="no-item-wrapper">
                                    <p>{{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER_MODAL_HELP_TEXT_1') }}</p>
                                    <p>{{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER_MODAL_HELP_TEXT_2') }}</p>
                                </div>
                            </template>
                        </cost-explorer-filter-tags>
                    </div>
                </div>
            </div>
        </template>
        <template #reset-button>
            {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CLEAR_ALL') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.cost-explorer-set-filter-modal {
    /* custom design-system component - p-button-modal */
    :deep(&.p-button-modal) {
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

            /* custom design-system component - p-collapsible-list */
            :deep(.collapsible-list-section) {
                @apply flex flex-wrap flex-col gap-1;
                .collapsible-item {
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
                @apply rounded-lg border border-gray-200;
                min-height: 11rem;
                padding: 1rem;

                .cost-explorer-filter-tags {
                    height: auto;
                    padding: 1rem 0;
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
