<script lang="ts" setup>

import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PSelectDropdown, PBadge,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';


import { i18n } from '@/translations';

import {
    DYNAMIC_COST_QUERY_SET_PARAMS,
} from '@/services/cost-explorer/cost-analysis/config';
import CostAnalysisPeriodSelectDropdown
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisPeriodSelectDropdown.vue';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { CostQuerySetOption, Granularity } from '@/services/cost-explorer/type';


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const route = useRoute();

const state = reactive({
    granularityItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: GRANULARITY.DAILY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DAILY'),
        },
        {
            type: 'item',
            name: GRANULARITY.MONTHLY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MONTHLY'),
        },
        {
            type: 'item',
            name: GRANULARITY.YEARLY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.YEARLY'),
        },
    ])),
    granularity: undefined as Granularity|undefined,
    showPeriodBadge: computed<boolean>(() => costAnalysisPageStore.selectedQueryId === DYNAMIC_COST_QUERY_SET_PARAMS || !costAnalysisPageState.relativePeriod),
    periodBadgeText: computed<string>(() => {
        if (!costAnalysisPageState.period) return '';
        let startDateFormat = 'MMM D';
        if (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) startDateFormat = 'MMM YYYY';
        else if (costAnalysisPageState.granularity === GRANULARITY.YEARLY) startDateFormat = 'YYYY';
        const endDateFormat = costAnalysisPageState.granularity === GRANULARITY.DAILY ? 'MMM D, YYYY' : startDateFormat;
        //
        const start = dayjs.utc(costAnalysisPageState.period.start);
        let end = dayjs.utc(costAnalysisPageState.period.end);
        if (costAnalysisPageState.granularity === GRANULARITY.DAILY) end = dayjs.utc(costAnalysisPageState.period.end).endOf('month');
        return `${start.format(startDateFormat)} ~ ${end.format(endDateFormat)}`;
    }),
    optionForInitialPeriod: undefined as CostQuerySetOption|undefined,
});

/* event */
const handleSelectGranularity = async (granularity: Granularity) => {
    costAnalysisPageStore.$patch({ granularity });
    state.granularity = granularity;
};


/* NOTE: Case for changing query set(LNB, Dynamic Link) */
watch(() => costAnalysisPageStore.selectedQueryId, (after, before) => {
    if (!after) return;
    if (route.params.costQuerySetId === DYNAMIC_COST_QUERY_SET_PARAMS) {
        state.optionForInitialPeriod = {
            granularity: costAnalysisPageState.granularity,
            period: costAnalysisPageState.period,
        };
    } else if (after !== before) {
        state.optionForInitialPeriod = costAnalysisPageStore.selectedQuerySet?.options;
    }
}, { immediate: true });
</script>

<template>
    <div class="cost-analysis-granularity-period-dropdown">
        <p-select-dropdown :menu="state.granularityItems"
                           :selection-label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY')"
                           style-type="rounded"
                           :selected="costAnalysisPageState.granularity"
                           class="granularity-dropdown"
                           @select="handleSelectGranularity"
        />
        <cost-analysis-period-select-dropdown :option-for-initial-period="state.optionForInitialPeriod"
                                              :granularity="state.granularity"
        />
        <p-badge v-if="state.showPeriodBadge"
                 badge-type="subtle"
                 style-type="gray200"
        >
            {{ state.periodBadgeText }}
        </p-badge>
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-granularity-period-dropdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    .granularity-dropdown {
        min-width: unset;
    }
}

</style>
