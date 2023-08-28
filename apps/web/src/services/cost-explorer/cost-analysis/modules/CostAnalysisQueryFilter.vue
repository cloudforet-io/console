<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PIconButton, PSelectDropdown, PToggleButton, PFieldTitle,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import CostAnalysisPeriodSelectDropdown
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisPeriodSelectDropdown.vue';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/type';

const CostAnalysisSetQueryModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisSetQueryModal.vue');

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
    <div class="cost-analysis-query-filter">
        <div class="filter-wrapper tablet-off">
            <div class="left-part">
                <div class="filter-item">
                    <b class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}</b>
                    <p-select-dropdown :items="state.granularityItems"
                                       :selected="costAnalysisPageState.granularity"
                                       style-type="transparent"
                                       class="granularity-select"
                                       @select="handleSelectGranularity"
                    />
                </div>
                <div class="filter-item">
                    <span class="v-divider" />
                    <p-field-title :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACK')">
                        <template #right>
                            <p-toggle-button :value="costAnalysisPageState.stack"
                                             class="toggle-button"
                                             @change-toggle="handleToggleStack"
                            />
                        </template>
                    </p-field-title>
                </div>
            </div>
            <div class="right-part">
                <span class="timezone-text">UTC</span>
                <cost-analysis-period-select-dropdown :fixed-period="costAnalysisPageState.period"
                                                      @update="handleSelectedDates"
                />
                <span class="v-divider" />
                <currency-select-dropdown />
            </div>
        </div>
        <div class="filter-wrapper tablet-on">
            <div class="right-part">
                <cost-analysis-period-select-dropdown :fixed-period="costAnalysisPageState.period"
                                                      @update="handleSelectedDates"
                />
                <span class="v-divider" />
                <p-icon-button class="filter-item"
                               name="ic_settings-filled"
                               @click="handleClickSetFilter"
                />
            </div>
        </div>
        <cost-analysis-set-query-modal :visible.sync="state.setQueryModalVisible" />
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
