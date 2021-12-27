<template>
    <div class="cost-analysis-query-filter">
        <div class="filter-wrapper tablet-off">
            <div class="left-part">
                <div class="filter-item">
                    <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}</b>
                    <p-select-dropdown :items="granularityItems"
                                       :selected="granularity"
                                       without-outline
                                       @select="handleSelectGranularity"
                    />
                </div>
                <div v-if="granularity !== GRANULARITY.ACCUMULATED" class="filter-item">
                    <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACK') }}</b>
                    <p-toggle-button class="ml-2"
                                     :value="stack"
                                     @change="handleToggleStack"
                    />
                </div>
            </div>
            <div class="right-part">
                <span class="timezone-text">UTC</span>
                <cost-analysis-period-select-dropdown :fixed-period="period" @update="handleSelectedDates" />
                <currency-select-dropdown />
                <p-icon-button class="filter-item" name="ic_refresh" @click="handleClickRefresh" />
            </div>
        </div>
        <div class="filter-wrapper tablet-on">
            <div class="left-part">
                <span class="timezone-text">UTC</span>
                <span>{{ `${dateFormatter(period.start)} ~ ${dateFormatter(period.end)}` }}</span>
            </div>
            <div class="right-part">
                <p-icon-button class="filter-item" name="ic_setting" @click="handleClickSetFilter" />
                <p-icon-button class="filter-item" name="ic_refresh" @click="handleClickRefresh" />
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
import CostAnalysisSetQueryModal from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSetQueryModal.vue';
import CostAnalysisPeriodSelectDropdown
    from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisPeriodSelectDropdown.vue';

import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { store } from '@/store';
import { i18n } from '@/translations';
import { Period } from '@/services/billing/cost-management/type';


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
                {
                    type: 'item',
                    name: GRANULARITY.YEARLY,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.YEARLY'),
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
        const handleClickRefresh = async () => {
            // todo
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
            handleClickRefresh,
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
        padding-bottom: 1rem;

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
            margin-right: 0.5rem;
            &::after {
                @apply bg-gray-300;
                display: inline-block;
                position: relative;
                content: '';
                width: 1px;
                height: 1rem;
            }
            &:last-child {
                &::after {
                    display: none;
                }
            }

            @screen tablet {
                &::after {
                    display: none;
                }
            }
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
    }
}
</style>
