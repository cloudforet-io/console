<template>
    <div class="cost-analysis-query-filter">
        <div class="filter-wrapper tablet-off">
            <div class="left-part">
                <div class="filter-item">
                    <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}</b>
                    <p-select-dropdown :items="granularityItems"
                                       :selected="granularity"
                                       without-outline
                                       :read-only="printMode"
                                       @select="handleSelectGranularity"
                    />
                </div>
                <div v-if="granularity !== GRANULARITY.ACCUMULATED" class="filter-item">
                    <template v-if="!printMode">
                        <span class="v-divider" />
                        <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACK') }}</b>
                        <p-toggle-button class="ml-2"
                                         :value="stack"
                                         @change="handleToggleStack"
                        />
                    </template>
                    <template v-else-if="stack">
                        <span class="v-divider" />
                        <span>Stacked</span>
                    </template>
                </div>
            </div>
            <div class="right-part">
                <span class="timezone-text">UTC</span>
                <cost-analysis-period-select-dropdown :fixed-period="period" :print-mode="printMode" @update="handleSelectedDates" />
                <span class="v-divider" />
                <currency-select-dropdown :print-mode="printMode" />
            </div>
        </div>
        <div class="filter-wrapper tablet-on">
            <div class="right-part">
                <cost-analysis-period-select-dropdown :fixed-period="period" :print-mode="printMode" @update="handleSelectedDates" />
                <span class="v-divider" />
                <p-icon-button class="filter-item" name="ic_setting" @click="handleClickSetFilter" />
            </div>
        </div>
        <cost-analysis-set-query-modal :visible.sync="setQueryModalVisible" />
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PIconButton, PSelectDropdown, PToggleButton,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import CurrencySelectDropdown from '@/services/billing/cost-management/modules/CurrencySelectDropdown.vue';
import CostAnalysisPeriodSelectDropdown
    from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisPeriodSelectDropdown.vue';

import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { store } from '@/store';
import { i18n } from '@/translations';
import { Period } from '@/services/billing/cost-management/type';

const CostAnalysisSetQueryModal = () => import('@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSetQueryModal.vue');

export default {
    name: 'CostAnalysisQueryFilter',
    components: {
        CurrencySelectDropdown,
        CostAnalysisSetQueryModal,
        CostAnalysisPeriodSelectDropdown,
        PSelectDropdown,
        PIconButton,
        PToggleButton,
    },
    props: {
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const state = reactive({
            granularity: computed(() => store.state.service.costAnalysis.granularity),
            stack: computed(() => store.state.service.costAnalysis.stack),
            period: computed<Period>(() => store.state.service.costAnalysis.period),
            //
            granularityItems: computed<MenuItem[]>(() => ([
                {
                    type: 'item',
                    name: GRANULARITY.ACCUMULATED,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ACCUMULATED'),
                },
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
        const handleSelectGranularity = async (granularity: string) => {
            store.commit('service/costAnalysis/setGranularity', granularity);
        };
        const handleToggleStack = async ({ value }) => {
            store.commit('service/costAnalysis/setStack', value);
        };
        const handleSelectedDates = (period) => {
            store.commit('service/costAnalysis/setPeriod', period);
        };
        const handleClickSetFilter = () => {
            state.setQueryModalVisible = true;
        };

        const dateFormatter = date => dayjs.utc(date).format('YYYY/MM/DD');

        return {
            ...toRefs(state),
            GRANULARITY,
            handleSelectGranularity,
            handleToggleStack,
            handleSelectedDates,
            handleClickSetFilter,
            dateFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-query-filter {
    .filter-wrapper {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        margin-bottom: 1rem;
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
