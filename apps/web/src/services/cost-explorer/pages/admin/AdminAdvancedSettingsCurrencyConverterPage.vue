<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import dayjs from 'dayjs';

import {
    PPaneLayout, PFieldGroup, PSelectDropdown, PTextInput, PCheckbox, PRadioGroup, PRadio, PBadge, PButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { CURRENCY } from '@/store/modules/display/config';
import type { Currency } from '@/store/modules/display/type';

import ScopedNotification from '@/common/components/scoped-notification/ScopedNotification.vue';

type RateSourceMenuType = {
    name: string;
    label: TranslateResult;
};
type EnteredRatesSourceType = {
    currency: string;
    value?: string;
    invalid: boolean;
};

const state = reactive<{
    aggregationDate: number,
    checkLastDayOfTheMonth: boolean,
    nextMonth: ComputedRef<string>,
}>({
    aggregationDate: 10,
    checkLastDayOfTheMonth: false,
    nextMonth: computed(() => dayjs.utc().add(1, 'month').format('MMMM')),
});
const currencyDropdownState = reactive<{
    menuItems: ComputedRef<SelectDropdownMenuItem[]>,
    selectedItem?: Currency,
}>({
    menuItems: computed(() => [
        { label: CURRENCY.KRW, name: CURRENCY.KRW },
        { label: CURRENCY.JPY, name: CURRENCY.JPY },
        { label: CURRENCY.USD, name: CURRENCY.USD },
    ]),
    selectedItem: CURRENCY.KRW,
});
const ratesSourceState = reactive<{
    numberFormatterOption: ComputedRef<Intl.NumberFormatOptions>,
    menuItems: ComputedRef<RateSourceMenuType[]>,
    selectedRadioIdx?: number,
    extraMenuItems: ComputedRef<SelectDropdownMenuItem[]>,
    enteredRates: EnteredRatesSourceType[],
}>({
    numberFormatterOption: computed(() => ({ currency: currencyDropdownState.selectedItem, style: 'decimal', notation: 'standard' })),
    menuItems: computed(() => [
        { name: 'yahoo', label: i18n.t('COST_EXPLORER.CURRENCY_CONVERTER.YAHOO') },
        { name: 'enter', label: i18n.t('COST_EXPLORER.CURRENCY_CONVERTER.DATA_ENTER') },
    ]),
    selectedRadioIdx: 0,
    extraMenuItems: computed(() => currencyDropdownState.menuItems.filter((i) => i.name !== currencyDropdownState.selectedItem)),
    enteredRates: [],
});

const handleCheckLastDayOfTheMonth = () => {};
const handleClickRadio = (idx: number) => {
    ratesSourceState.selectedRadioIdx = idx;
};
const handleChangeInput = (idx: number, value: string) => {
    ratesSourceState.enteredRates[idx].value = value;
    ratesSourceState.enteredRates[idx].invalid = value === '0' || !value;
};

watch(() => ratesSourceState.extraMenuItems, (extraMenuItems) => {
    ratesSourceState.enteredRates = extraMenuItems.map((i) => ({
        currency: i.name,
        value: '1',
        invalid: false,
    }));
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="admin-domain-settings-currency-converter-page">
        <scoped-notification type="info"
                             :title="$t('COST_EXPLORER.CURRENCY_CONVERTER.NOTIFICATION', { month: state.nextMonth })"
                             title-icon="ic_info-circle"
                             :visible="true"
                             layout="insection"
                             hide-header-close-button
        />
        <div class="contents-wrapper">
            <p-field-group :label="$t('COST_EXPLORER.CURRENCY_CONVERTER.BASE_CURRENCY')"
                           style-type="primary"
                           required
            >
                <p-select-dropdown :menu="currencyDropdownState.menuItems"
                                   :selected.sync="currencyDropdownState.selectedItem"
                                   use-fixed-menu-style
                                   class="base-currency-dropdown"
                >
                    <template #dropdown-button>
                        <span class="dropdown-button-inner">
                            {{ currencyDropdownState.selectedItem }}
                            <p-badge style-type="indigo100"
                                     badge-type="subtle"
                            >
                                <span>{{ $t('COST_EXPLORER.CURRENCY_CONVERTER.DEFAULT') }}</span>
                            </p-badge>
                        </span>
                    </template>
                </p-select-dropdown>
            </p-field-group>
            <p-field-group :label="$t('COST_EXPLORER.CURRENCY_CONVERTER.AGGREGATION_DATE')"
                           style-type="primary"
                           required
            >
                <div class="aggregation-date-wrapper">
                    <p-text-input v-model="state.aggregationDate"
                                  class="text-input"
                    />
                    <p-checkbox v-model="state.checkLastDayOfTheMonth"
                                @change="handleCheckLastDayOfTheMonth"
                    >
                        {{ $t('COST_EXPLORER.CURRENCY_CONVERTER.CHECKBOX') }}
                    </p-checkbox>
                </div>
            </p-field-group>
            <p-field-group :label="$t('COST_EXPLORER.CURRENCY_CONVERTER.EXCHANGE_RATES_SOURCE')"
                           style-type="primary"
                           required
            >
                <div class="rates-source-wrapper">
                    <p-radio-group :direction="'vertical'">
                        <p-radio v-for="(type, idx) in ratesSourceState.menuItems"
                                 :key="type.name"
                                 v-model="ratesSourceState.selectedRadioIdx"
                                 :value="idx"
                                 @change="handleClickRadio(idx)"
                        >
                            {{ type.label }}
                        </p-radio>
                    </p-radio-group>
                    <div v-if="ratesSourceState.selectedRadioIdx === 1"
                         class="source-input-wrapper"
                    >
                        <p-field-group v-for="(item, idx) in ratesSourceState.extraMenuItems"
                                       :key="`rates-source-${item.name}-input-${idx}`"
                                       style-type="primary"
                                       :invalid="ratesSourceState.enteredRates[idx].invalid"
                                       :invalid-text="$t('COST_EXPLORER.CURRENCY_CONVERTER.ALT_E_RATES')"
                                       required
                        >
                            <div class="input-wrapper">
                                <p-text-input :value="1"
                                              class="text-input"
                                              disabled
                                >
                                    <template #right-extra>
                                        <span>{{ ratesSourceState.extraMenuItems[idx].label }}</span>
                                    </template>
                                </p-text-input>
                                <span>=</span>
                                <p-text-input :value="ratesSourceState.enteredRates[idx].value"
                                              class="text-input"
                                              type="number"
                                              :invalid="ratesSourceState.enteredRates[idx].invalid"
                                              @update:value="handleChangeInput(idx, $event)"
                                >
                                    <template #right-extra>
                                        <span>{{ currencyDropdownState.selectedItem }}</span>
                                    </template>
                                </p-text-input>
                            </div>
                        </p-field-group>
                    </div>
                </div>
            </p-field-group>
            <p-button style-type="primary"
                      size="md"
                      class="save-changes-button"
            >
                {{ $t('COST_EXPLORER.CURRENCY_CONVERTER.SAVE_CHANGES') }}
            </p-button>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.admin-domain-settings-currency-converter-page {
    @apply flex flex-col;
    gap: 1.5rem;
    padding: 1.5rem 1rem;
    :deep(.scoped-notification) {
        @apply flex items-center;
        .content-wrapper {
            margin-top: 0.125rem;
            .left-part {
                .title-wrapper {
                    @apply text-paragraph-md text-gray-900 font-normal;
                    min-height: initial;
                }
            }
        }
    }
    .contents-wrapper {
        @apply flex flex-col;
        gap: 0.5rem;
        .base-currency-dropdown {
            min-width: 9rem;
        }
        .aggregation-date-wrapper {
            @apply flex items-center;
            gap: 0.5rem;
        }
        .rates-source-wrapper {
            /* custom design-system component - p-radio-group */
            :deep(.p-radio-group) {
                gap: 0.25rem;
            }
            .source-input-wrapper {
                margin-top: 1rem;
                .input-wrapper {
                    @apply flex items-center;
                    gap: 0.5rem;
                }
            }
        }
        .text-input {
            width: 9rem;
        }

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            input[type="number"]::-webkit-outer-spin-button,
            input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type="number"] {
                width: 100%;
                -moz-appearance: textfield;
            }
        }

        /* custom design-system component - p-field-group */
        :deep(.p-field-group) {
            .invalid-feedback {
                margin-left: 10.625rem;
            }
        }
        .save-changes-button {
            width: 9rem;
        }
    }
}

</style>
