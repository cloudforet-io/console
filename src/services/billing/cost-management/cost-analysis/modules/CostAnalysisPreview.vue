<template>
    <div class="cost-analysis-preview">
        <cost-analysis-header print-mode />
        <cost-analysis-query-filter print-mode />
        <cost-analysis-group-by-filter print-mode />
        <cost-analysis-chart print-mode />
        <cost-analysis-data-table />
    </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import CostAnalysisChart from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisQueryFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import CostAnalysisGroupByFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisGroupByFilter.vue';

import CostAnalysisDataTable from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisDataTable.vue';
import { store } from '@/store';
import { i18n } from '@/translations';
import { CostQuerySetModel } from '@/services/billing/cost-management/type';
import CostAnalysisHeader from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisHeader.vue';

export default {
    name: 'CostAnalysisPreview',
    components: {
        CostAnalysisHeader,
        CostAnalysisDataTable,
        CostAnalysisGroupByFilter,
        CostAnalysisChart,
        CostAnalysisQueryFilter,
    },
    setup() {
        const state = reactive({
            defaultTitle: computed<TranslateResult>(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COST_ANALYSIS')),
            selectedQueryId: computed<string|undefined>(() => store.state.service.costAnalysis.selectedQueryId),
            selectedQuerySet: computed<CostQuerySetModel|undefined>(() => store.getters['service/costAnalysis/selectedQuerySet']),
            title: computed<string>(() => state.selectedQuerySet?.name ?? 'Cost Analysis'),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
