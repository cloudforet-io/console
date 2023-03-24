<template>
    <p-button-modal
        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SET_QUERY')"
        :visible.sync="proxyVisible"
        size="sm"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <div class="set-query-modal-body">
                <div class="input-wrapper">
                    <p class="input-title">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}
                    </p>
                    <p-select-dropdown
                        class="select-input-box"
                        use-fixed-menu-style
                        :items="granularityItems"
                        :selected="granularity"
                        @select="handleSelectGranularity"
                    />
                </div>
                <div v-if="granularity !== GRANULARITY.ACCUMULATED"
                     class="input-wrapper"
                >
                    <p class="input-title">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACK') }}
                    </p>
                    <p-toggle-button :value="stack"
                                     @change-toggle="handleToggleStack"
                    />
                </div>
                <div class="input-wrapper">
                    <p class="input-title">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CURRENCY') }}
                    </p>
                    <p class="input-description">
                        Global setting
                    </p>
                    <p-select-dropdown
                        class="select-input-box"
                        :items="currencyItems"
                        :selected="currency"
                        use-fixed-menu-style
                        @select="handleSelectCurrency"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal,
    PSelectDropdown,
    PToggleButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY_SYMBOL } from '@/store/modules/display/config';

import { useProxyValue } from '@/common/composables/proxy-state';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/type';


export default {
    name: 'CostAnalysisSetQueryModal',
    components: {
        PButtonModal,
        PSelectDropdown,
        PToggleButton,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const costAnalysisPageStore = useCostAnalysisPageStore();
        const costAnalysisPageState = costAnalysisPageStore.$state;

        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            granularity: '' as Granularity,
            stack: false,
            currency: '' as Currency,
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
            currencyItems: computed<MenuItem[]>(() => Object.keys(store.state.display.currencyRates).map((currency) => ({
                type: 'item',
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
            }))),
        });

        const handleFormConfirm = async () => {
            if (costAnalysisPageState.granularity !== state.granularity) {
                costAnalysisPageStore.$patch((_state) => {
                    _state.period = getInitialDates();
                });
            }
            costAnalysisPageStore.$patch({
                granularity: state.granularity,
                stack: state.stack,
            });
            store.commit('display/setCurrency', state.currency);

            state.proxyVisible = false;
        };
        const handleSelectGranularity = (granularity: Granularity) => {
            state.granularity = granularity;
        };
        const handleSelectCurrency = (currency: Currency) => {
            state.currency = currency;
        };
        const handleToggleStack = (value) => {
            state.stack = value;
        };

        watch(() => state.proxyVisible, (after) => {
            if (after) {
                state.granularity = costAnalysisPageState.granularity;
                state.stack = costAnalysisPageState.stack;
                state.currency = store.state.display.currency;
            }
        });

        return {
            ...toRefs(state),
            GRANULARITY,
            handleFormConfirm,
            handleSelectGranularity,
            handleSelectCurrency,
            handleToggleStack,
        };
    },
};

</script>

<style scoped lang="postcss">
.set-query-modal-body {
    margin-bottom: 2rem;
    .input-wrapper {
        .input-title {
            @apply font-bold;
            margin-top: 1rem;
            margin-bottom: 0.375rem;
            font-size: 0.875rem;
            line-height: 140%;
        }
        .select-input-box {
            width: 100%;
        }
        .input-description {
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }
    }
}
</style>
