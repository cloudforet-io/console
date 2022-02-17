<template>
    <div class="cost-analysis-preview">
        <section class="title-section">
            <p-page-title>
                <template #title>
                    <div class="title-main-wrapper">
                        <span>{{ selectedQueryId ? title : defaultTitle }}</span>
                    </div>
                </template>
                <template #extra>
                    <div class="title-extra-wrapper">
                        <span />
                    </div>
                </template>
            </p-page-title>
        </section>
        <cost-analysis-query-filter />
        <cost-analysis-group-by-filter />
        <cost-analysis-chart />
        <cost-analysis-data-table />
    </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import { PPageTitle } from '@spaceone/design-system';

import CostAnalysisChart from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisQueryFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import CostAnalysisGroupByFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisGroupByFilter.vue';

import CostAnalysisDataTable from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisDataTable.vue';
import { store } from '@/store';
import { i18n } from '@/translations';
import { CostQuerySetModel } from '@/services/billing/cost-management/type';

export default {
    name: 'CostAnalysisPreview',
    components: {
        PPageTitle,
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

<style lang="postcss" scoped>
.cost-analysis-preview {
    .title-section {
        @apply relative;
        display: flex;

        .p-page-title {
            flex-wrap: wrap;
            row-gap: 2rem;
        }

        .title-main-wrapper {
            @apply flex items-center flex-wrap gap-2;
            margin-left: 2.5rem;
        }

        .dropdown-item-modal {
            @apply flex items-center flex-wrap gap-1;

            .default-item-suffix {
                @apply text-gray-400;
            }
        }

        .query-item-wrapper {
            @apply flex justify-between;
            width: 100%;
        }

        .title-extra-wrapper {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }

    .cost-analysis-chart {
        @apply relative z-10;
        margin-bottom: 1rem;
    }

    @screen mobile {
        &::v-deep .extra {
            width: 100%;
        }
    }
}
</style>
