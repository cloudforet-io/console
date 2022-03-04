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
                <div v-if="granularity !== GRANULARITY.ACCUMULATED" class="input-wrapper">
                    <p class="input-title">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACK') }}
                    </p>
                    <p-toggle-button sync
                                     :value="stack"
                                     @change="handleToggleStack"
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
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal,
    PSelectDropdown,
    PToggleButton,
} from '@spaceone/design-system';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { store } from '@/store';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { i18n } from '@/translations';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { getInitialDates } from '@/services/billing/cost-management/cost-analysis/lib/helper';


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
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            granularity: '' as GRANULARITY,
            stack: false,
            currency: '' as CURRENCY,
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
            currencyItems: computed<MenuItem[]>(() => Object.values(CURRENCY).map(currency => ({
                type: 'item',
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
            }))),
        });

        const handleFormConfirm = async () => {
            if (store.state.service.costAnalysis.granularity !== state.granularity) {
                await store.commit('service/costAnalysis/setPeriod', getInitialDates());
            }
            store.commit('service/costAnalysis/setGranularity', state.granularity);
            store.commit('service/costAnalysis/setStack', state.stack);
            store.commit('display/setCurrency', state.currency);

            state.proxyVisible = false;
        };
        const handleSelectGranularity = (granularity: string) => {
            state.granularity = granularity;
        };
        const handleSelectCurrency = (currency: CURRENCY) => {
            state.currency = currency;
        };
        const handleToggleStack = ({ value }) => {
            state.stack = value;
        };

        watch(() => state.proxyVisible, (after) => {
            if (after) {
                state.granularity = store.state.service.costAnalysis.granularity;
                state.stack = store.state.service.costAnalysis.stack;
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
