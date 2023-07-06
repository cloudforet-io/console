<script lang="ts" setup>
import { PDivider, PSelectButton } from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import CostAnalysisGroupByFilterMore
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilterMore.vue';
import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';

interface Props {
    printMode: boolean;
}

withDefaults(defineProps<Props>(), {
    printMode: false,
});
const { t } = useI18n();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    selectedGroupByItems: computed(() => costAnalysisPageState.groupBy.map((d) => GROUP_BY_ITEM_MAP[d])),
    allGroupByItems: Object.values(GROUP_BY_ITEM_MAP),
});

/* util */
const predicate = (current, data) => Object.keys(current).every((key) => data && current[key] === data[key]);

/* event */
const handleSelectGroupByItems = async (items) => {
    costAnalysisPageStore.$patch({ groupBy: items.map((d) => d.name) });
};

</script>

<template>
    <div class="cost-analysis-group-by-filter"
         :class="{ 'print-mode': printMode }"
    >
        <b class="label">{{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GROUP_BY') }}</b>
        <p-select-button v-for="groupByItem in (printMode ? state.selectedGroupByItems : state.allGroupByItems)"
                         :key="groupByItem.name"
                         :value="groupByItem"
                         :selected="printMode ? '' : state.selectedGroupByItems"
                         multi-selectable
                         size="sm"
                         :predicate="predicate"
                         @change="handleSelectGroupByItems"
        >
            {{ groupByItem.label }}
        </p-select-button>
        <p-divider :vertical="true" />
        <cost-analysis-group-by-filter-more />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-group-by-filter {
    @apply flex flex-wrap bg-white rounded-md border border-gray-200;
    column-gap: 0.375rem;
    row-gap: 0.5rem;
    align-items: center;
    font-size: 0.875rem;
    padding: 1rem;
    margin-bottom: 1rem;
    &.print-mode {
        .label {
            @apply mr-3;
            white-space: nowrap;
        }
    }
    .p-divider {
        @apply bg-gray-300;
        height: 1rem;
        margin: 0 0.375rem;
    }
}
</style>
