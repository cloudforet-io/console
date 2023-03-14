<template>
    <div class="cost-analysis-group-by-filter"
         :class="{ 'print-mode': printMode }"
    >
        <b class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GROUP_BY') }}</b>
        <p-select-button v-for="groupByItem in (printMode ? selectedGroupByItems : allGroupByItems)"
                         :key="groupByItem.name"
                         :value="groupByItem"
                         :selected="printMode ? '' : selectedGroupByItems"
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

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PDivider, PSelectButton } from '@spaceone/design-system';

import CostAnalysisGroupByFilterMore
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilterMore.vue';
import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { GroupByItem } from '@/services/cost-explorer/store/cost-analysis/type';


export default {
    name: 'CostAnalysisGroupByFilter',
    components: {
        CostAnalysisGroupByFilterMore,
        PSelectButton,
        PDivider,
    },
    props: {
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const costAnalysisPageStore = useCostAnalysisPageStore();
        const costAnalysisPageState = costAnalysisPageStore.state;

        const state = reactive({
            selectedGroupByItems: computed<GroupByItem[]>(() => costAnalysisPageState.groupBy.map((d) => GROUP_BY_ITEM_MAP[d])),
            allGroupByItems: Object.values(GROUP_BY_ITEM_MAP) as GroupByItem[],
        });

        /* util */
        const predicate = (current, data) => Object.keys(current).every((key) => data && current[key] === data[key]);

        /* event */
        const handleSelectGroupByItems = async (items: GroupByItem[]) => {
            costAnalysisPageState.groupBy = items.map((d) => d.name);
        };

        return {
            ...toRefs(state),
            handleSelectGroupByItems,
            predicate,
        };
    },
};
</script>

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
