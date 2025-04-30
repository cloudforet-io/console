<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import {
    PFieldGroup, PCheckbox, PRadioGroup, PRadio, PBadge, PHeading,
    PPaneLayout, PTextInput, PSelectDropdown, PButton, PScopedNotification,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useDomainConfigStore } from '@/store/config/domain-config-store';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';

import config from '@/lib/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { initDomain } from '@/lib/site-initializer/domain';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { UnifiedCostConfig } from '@/services/advanced/types/preferences-type';
import {
    DEFAULT_UNIFIED_COST_CURRENCY,
    YAHOO_FINANCE_ID,
} from '@/services/cost-explorer/constants/cost-explorer-constant';

const DEFAULT_AGGREGATION_DATE = 15;

const domainConfigStore = useDomainConfigStore();
const domainConfigGetters = domainConfigStore.getters;

const exchangeRateSourceOptions = [YAHOO_FINANCE_ID];

const state = reactive({
    loading: false,
    originUnifiedCostConfig: computed<UnifiedCostConfig|undefined>(() => domainConfigGetters?.unifiedCostConfig),
    isSaveChangesButtonDisabled: computed<boolean>(() => {
        if (formState.aggregationDate === '') {
            return true;
        }
        const aggregationDate:number = (typeof formState.aggregationDate === 'string') ? parseInt(formState.aggregationDate) : formState.aggregationDate;

        let isSameAggregationDate = aggregationDate === state.originUnifiedCostConfig?.aggregation_day;
        if (aggregationDate < 1 || aggregationDate > 31) {
            isSameAggregationDate = true;
        }
        return (formState.currency === state.originUnifiedCostConfig?.currency
        && isSameAggregationDate
        && formState.exchangeRateSource === state.originUnifiedCostConfig?.exchange_source
        && formState.lastDayOfMonth === state.originUnifiedCostConfig?.is_last_day);
    }),
});

const formState = reactive<{
    currency: Currency;
    aggregationDate: number|string;
    exchangeRateSource: string;
    lastDayOfMonth: boolean;
}>({
    currency: state.originUnifiedCostConfig?.currency ?? DEFAULT_UNIFIED_COST_CURRENCY,
    aggregationDate: state.originUnifiedCostConfig?.aggregation_day ?? DEFAULT_AGGREGATION_DATE,
    exchangeRateSource: state.originUnifiedCostConfig?.exchange_source ?? YAHOO_FINANCE_ID,
    lastDayOfMonth: state.originUnifiedCostConfig?.is_last_day ?? false,
});

const handleSaveChanges = async () => {
    try {
        state.loading = true;
        await domainConfigStore.updatePreferences({
            ...domainConfigStore.state.domainConfig?.data,
            unified_cost_config: {
                ...state.originUnifiedCostConfig,
                currency: formState.currency,
                aggregation_day: parseInt(formState.aggregationDate),
                exchange_source: formState.exchangeRateSource,
                is_last_day: formState.lastDayOfMonth,
            },
        });
        await initDomain(config);
        showSuccessMessage(i18n.t('COST_EXPLORER.CURRENCY_CONVERTER_PAGE.UPDATE_SUCCESS_ALT'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        state.loading = false;
    }
};

const getLastDay = (): number => {
    const today = dayjs.utc();
    if (today.isSame(today.endOf('month'), 'day')) {
        return today.add(1, 'month').endOf('month').date();
    }
    return today.endOf('month').date();
};

const handleUpdateLastDayOfMonth = (value:boolean) => {
    formState.lastDayOfMonth = value;
    if (value) {
        formState.aggregationDate = getLastDay();
    }
};

watch(() => state.originUnifiedCostConfig, (unifiedCostConfig) => {
    formState.currency = unifiedCostConfig?.currency ?? DEFAULT_UNIFIED_COST_CURRENCY;
    formState.aggregationDate = unifiedCostConfig?.aggregation_day ?? DEFAULT_AGGREGATION_DATE;
    formState.exchangeRateSource = unifiedCostConfig?.exchange_source ?? YAHOO_FINANCE_ID;
    formState.lastDayOfMonth = unifiedCostConfig?.is_last_day ?? false;
});

</script>

<template>
    <p-pane-layout class="advanced-settings-currency-converter">
        <div class="content-wrapper">
            <p-heading :title="$t('COST_EXPLORER.CURRENCY_CONVERTER_PAGE.CURRENCY_CONVERTER')"
                       heading-type="sub"
                       class="content-title"
            />
            <p-scoped-notification type="information"
                                   icon="ic_info-circle"
                                   layout="in-section"
                                   class="mb-6"
            >
                {{ $t('COST_EXPLORER.CURRENCY_CONVERTER_PAGE.NOTIFICATION') }}
            </p-scoped-notification>
            <p-field-group :label="$t('COMMON.GNB.ACCOUNT.LABEL_CURRENCY')"
                           required
            >
                <p-select-dropdown class="currency-dropdown"
                                   :menu="Object.values(CURRENCY).map((currency) => ({ label: `${CURRENCY_SYMBOL[currency]} ${currency}`, name: currency }))"
                                   :selected="formState.currency"
                                   use-fixed-menu-style
                                   @update:selected="formState.currency = $event"
                >
                    <template #dropdown-button="item">
                        {{ item.label }}<p-badge v-if="item.label === DEFAULT_UNIFIED_COST_CURRENCY"
                                                 badge-type="subtle"
                                                 style-type="indigo100"
                        >
                            Default
                        </p-badge>
                    </template>
                    <template #menu-item--format="{item}">
                        <div class="menu-item">
                            <span>{{ item?.label }}</span>
                            <p-badge v-if="item.name === CURRENCY.KRW"
                                     class="ml-1"
                                     badge-type="subtle"
                                     style-type="indigo100"
                            >
                                Default
                            </p-badge>
                        </div>
                    </template>
                </p-select-dropdown>
            </p-field-group>
            <p-field-group :label="$t('COST_EXPLORER.CURRENCY_CONVERTER_PAGE.AGGREGATION_DATE')"
                           required
            >
                <div class="aggregation-field-wrapper">
                    <p-text-input
                        v-model="formState.aggregationDate"
                        class="aggregation-field"
                        type="number"
                        min="1"
                        max="31"
                        :disabled="formState.lastDayOfMonth"
                    />
                    <p-checkbox
                        :selected="formState.lastDayOfMonth"
                        class="ml-2"
                        @change="handleUpdateLastDayOfMonth"
                    >
                        {{ $t('COST_EXPLORER.CURRENCY_CONVERTER_PAGE.LAST_DAY_OF_THE_MONTH') }}
                    </p-checkbox>
                </div>
            </p-field-group>
            <p-field-group :label="$t('COST_EXPLORER.CURRENCY_CONVERTER_PAGE.EXCHANGE_RATE_SOURCE')"
                           required
            >
                <p-radio-group direction="vertical">
                    <p-radio v-for="source in exchangeRateSourceOptions"
                             :key="source"
                             v-model="formState.exchangeRateSource"
                             :label="source"
                             :value="source"
                    >
                        {{ source }}
                    </p-radio>
                </p-radio-group>
            </p-field-group>

            <p-button :disabled="state.isSaveChangesButtonDisabled"
                      class="mt-4"
                      :loading="state.loading"
                      @click="handleSaveChanges"
            >
                {{ $t('LADING.SAVE_CHANGES') }}
            </p-button>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.advanced-settings-currency-converter {
    .content-wrapper {
        padding: 1.5rem 1rem;

        .content-title {
            margin-bottom: 1rem;
        }

        .currency-dropdown {
            width: 9rem;
        }
    }

    .aggregation-field-wrapper {
        .aggregation-field {
            width: 9rem;
        }
    }
}
</style>
