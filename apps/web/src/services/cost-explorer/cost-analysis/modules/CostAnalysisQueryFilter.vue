<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import CostAnalysisPeriodSelectDropdown
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisPeriodSelectDropdown.vue';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/type';


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

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
    ])),
    setQueryModalVisible: false,
});

/* event */
const handleSelectGranularity = async (granularity: Granularity) => {
    if (granularity !== costAnalysisPageState.granularity) {
        costAnalysisPageStore.$patch((_state) => {
            _state.period = getInitialDates();
        });
    }
    costAnalysisPageStore.$patch({ granularity });
};
const handleSelectedDates = (period) => {
    costAnalysisPageStore.$patch((_state) => {
        _state.period = period;
    });
};
</script>

<template>
    <div class="cost-analysis-query-filter">
        <div class="filter-wrapper">
            <div class="left-part">
                <p-select-dropdown :items="state.granularityItems"
                                   :selected="costAnalysisPageState.granularity"
                                   class="granularity-selector"
                                   @select="handleSelectGranularity"
                />
                <cost-analysis-period-select-dropdown :fixed-period="costAnalysisPageState.period"
                                                      @update="handleSelectedDates"
                />
            </div>
            <div class="right-part" />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-query-filter {
    .filter-wrapper {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        margin-bottom: 1rem;
        .left-part {
            display: flex;
            align-items: center;
            .granularity-selector {
                margin-right: 0.5rem;
            }
        }
        .right-part {
            display: flex;
            align-items: center;
        }
    }

    @screen tablet {
        .right-part {
            margin-left: auto;
            flex-wrap: wrap;
            justify-content: flex-end;
        }
    }

    @screen mobile {
        .filter-wrapper {
            .cost-analysis-period-select-dropdown {
                width: 100%;
            }
        }
    }
}
</style>
