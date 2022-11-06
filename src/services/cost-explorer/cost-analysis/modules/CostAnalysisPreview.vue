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

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { i18n } from '@/translations';

import type { Item } from '@/common/components/layouts/PdfDownloadOverlay/PdfDownloadOverlay.vue';

import CostAnalysisChart from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisDataTable from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisDataTable.vue';
import CostAnalysisGroupByFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisHeader from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisHeader.vue';
import CostAnalysisQueryFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import { costExplorerStore } from '@/services/cost-explorer/store';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

export default {
    name: 'CostAnalysisPreview',
    components: {
        CostAnalysisHeader,
        CostAnalysisDataTable,
        CostAnalysisGroupByFilter,
        CostAnalysisChart,
        CostAnalysisQueryFilter,
    },
    setup(props, { emit }) {
        const state = reactive({
            defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
            selectedQueryId: computed<string|undefined>(() => costExplorerStore.state.costAnalysis.selectedQueryId),
            selectedQuerySet: computed<CostQuerySetModel|undefined>(() => costExplorerStore.getters['costAnalysis/selectedQuerySet']),
            title: computed<string>(() => state.selectedQuerySet?.name ?? 'Cost Analysis'),
            topContainerRef: null as null|HTMLElement,
            chartElements: [] as HTMLElement[],
            tableItems: [] as Item[],
        });

        const handleChartRendered = (elements: HTMLElement[]) => {
            if (!state.topContainerRef) return;
            state.chartElements = elements;
        };

        const handleDataTableRendered = (items: Item[]) => {
            state.tableItems = items;
        };

        watch([() => state.topContainerRef, () => state.chartElements, () => state.tableItems], ([topContainerRef, chartElements, tableItems]) => {
            if (!topContainerRef || !chartElements.length || !tableItems.length) return;

            const imageItems: Item[] = Array.from(topContainerRef.children)
                .concat(chartElements)
                .map((element) => ({ element: element as HTMLElement, type: 'image' }));

            emit('rendered', imageItems.concat(tableItems));
        });
        return {
            ...toRefs(state),
            handleChartRendered,
            handleDataTableRendered,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-preview {
    .cost-analysis-chart {
        margin-bottom: 1rem;
    }
}
</style>
