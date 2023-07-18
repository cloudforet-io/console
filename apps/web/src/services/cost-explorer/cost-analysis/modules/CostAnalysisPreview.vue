<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useI18n } from 'vue-i18n';

import type { Item } from '@/common/components/layouts/PdfDownloadOverlay/type';

import CostAnalysisChart from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisDataTable from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisDataTable.vue';
import CostAnalysisGroupByFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisHeader from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisHeader.vue';
import CostAnalysisQueryFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';

const emit = defineEmits<{(e: 'rendered', value: Item[]): void}>();
const { t } = useI18n();

const costAnalysisPageStore = useCostAnalysisPageStore();

const topContainerRef = ref<HTMLElement|null>(null);
const state = reactive({
    defaultTitle: computed<TranslateResult>(() => t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
    title: computed<string>(() => costAnalysisPageStore.selectedQuerySet?.name ?? 'Cost Analysis'),
    chartElements: [] as HTMLElement[],
    tableItems: [] as Item[],
});

const handleChartRendered = (elements: HTMLElement[]) => {
    if (!topContainerRef.value) return;
    state.chartElements = elements;
};

const handleDataTableRendered = (items: Item[]) => {
    state.tableItems = items;
};

watch([() => topContainerRef.value, () => state.chartElements, () => state.tableItems], ([_topContainerRef, chartElements, tableItems]) => {
    if (!_topContainerRef || !chartElements.length || !tableItems.length) return;

    const imageItems: Item[] = Array.from(_topContainerRef.children)
        .concat(chartElements)
        .map((element) => ({ element: element as HTMLElement, type: 'image' }));

    emit('rendered', imageItems.concat(tableItems));
});

</script>

<template>
    <div class="cost-analysis-preview">
        <div ref="topContainerRef">
            <cost-analysis-header print-mode />
            <cost-analysis-query-filter print-mode />
            <cost-analysis-group-by-filter print-mode />
        </div>
        <cost-analysis-chart print-mode
                             @rendered="handleChartRendered"
        />
        <cost-analysis-data-table print-mode
                                  @rendered="handleDataTableRendered"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-preview {
    .cost-analysis-chart {
        margin-bottom: 1rem;
    }
}
</style>
