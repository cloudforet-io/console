<script lang="ts" setup>
import {
    PIconButton, PSelectDropdown, PToggleButton, PFieldTitle,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import CostAnalysisPeriodSelectDropdown
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisPeriodSelectDropdown.vue';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/type';

const CostAnalysisSetQueryModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisSetQueryModal.vue');

interface Props {
    printMode?: boolean;
}

withDefaults(defineProps<Props>(), {
    printMode: false,
});
const { t } = useI18n();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    granularityItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: GRANULARITY.ACCUMULATED,
            label: t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ACCUMULATED'),
        },
        {
            type: 'item',
            name: GRANULARITY.DAILY,
            label: t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DAILY'),
        },
        {
            type: 'item',
            name: GRANULARITY.MONTHLY,
            label: t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MONTHLY'),
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
const handleToggleStack = async (value) => {
    costAnalysisPageStore.$patch({ stack: value });
};
const handleSelectedDates = (period) => {
    costAnalysisPageStore.$patch((_state) => {
        _state.period = period;
    });
};
const handleClickSetFilter = () => {
    state.setQueryModalVisible = true;
};

</script>

<template>
    <div class="cost-analysis-query-filter"
         :class="{ 'print-mode': printMode }"
    >
        <div class="filter-wrapper tablet-off">
            <div class="left-part">
                <div class="filter-item">
                    <b class="label">{{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}</b>
                    <p-select-dropdown :items="state.granularityItems"
                                       :selected="costAnalysisPageState.granularity"
                                       style-type="transparent"
                                       :read-only="printMode"
                                       class="granularity-select"
                                       @select="handleSelectGranularity"
                    />
                </div>
                <div v-if="costAnalysisPageState.granularity !== GRANULARITY.ACCUMULATED"
                     class="filter-item"
                >
                    <template v-if="!printMode">
                        <span class="v-divider" />
                        <p-field-title :label="t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACK')">
                            <template #right>
                                <p-toggle-button :value="costAnalysisPageState.stack"
                                                 class="toggle-button"
                                                 @change-toggle="handleToggleStack"
                                />
                            </template>
                        </p-field-title>
                    </template>
                    <template v-else-if="costAnalysisPageState.stack">
                        <span class="v-divider" />
                        <span>Stacked</span>
                    </template>
                </div>
            </div>
            <div class="right-part">
                <span class="timezone-text">UTC</span>
                <cost-analysis-period-select-dropdown :fixed-period="costAnalysisPageState.period"
                                                      :print-mode="printMode"
                                                      @update="handleSelectedDates"
                />
                <span class="v-divider" />
                <currency-select-dropdown :print-mode="printMode" />
            </div>
        </div>
        <div class="filter-wrapper tablet-on">
            <div class="right-part">
                <cost-analysis-period-select-dropdown :fixed-period="costAnalysisPageState.period"
                                                      :print-mode="printMode"
                                                      @update="handleSelectedDates"
                />
                <span class="v-divider" />
                <p-icon-button class="filter-item"
                               name="ic_settings-filled"
                               @click="handleClickSetFilter"
                />
            </div>
        </div>
        <cost-analysis-set-query-modal v-model:visible="state.setQueryModalVisible" />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-query-filter {
    .filter-wrapper {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        .timezone-text {
            @apply text-gray-400;
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 1.5;
            padding-right: 0.5rem;
        }
        .left-part {
            display: flex;
            align-items: center;
            .filter-item {
                .p-select-dropdown {
                    padding-left: 0.5rem;
                }
            }
        }
        .right-part {
            display: flex;
            align-items: center;
        }
        .filter-item {
            display: flex;
            align-items: center;
            .toggle-button {
                margin-left: 0.25rem;
            }
        }
        .v-divider {
            @apply bg-gray-300;
            display: inline-block;
            position: relative;
            width: 1px;
            height: 1rem;
            margin: 0 0.5rem;
        }
        .p-select-dropdown {
            @apply bg-transparent;
        }
    }
    .tablet-on {
        display: none;
    }

    &.print-mode {
        .label {
            white-space: nowrap;
        }

        /* custom design-system component - p-select-dropdown */
        :deep(.granularity-select) {
            .text {
                white-space: nowrap;
            }
        }
    }

    @screen tablet {
        .tablet-off {
            display: none;
        }
        .tablet-on {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
            padding-bottom: 1rem;
        }
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
            .v-divider {
                @apply hidden;
            }
        }
    }
}
</style>
