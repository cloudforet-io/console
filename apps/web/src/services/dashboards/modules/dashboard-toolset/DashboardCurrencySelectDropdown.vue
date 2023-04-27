<template>
    <p-select-dropdown :items="state.currencyItems"
                       :selected="state.currency"
                       style-type="transparent"
                       menu-position="right"
                       class="currency-select-dropdown"
                       @select="handleSelectCurrency"
    >
        <template #default="{ item }">
            <span>
                <span>{{ item.label }}</span>
                <p-badge v-if="item.badge"
                         style-type="indigo100"
                         badge-type="subtle"
                         shape="round"
                >
                    {{ item.badge }}
                </p-badge>
            </span>
        </template>
        <template #menu-item--format="{ item }">
            <span>
                <span>{{ item.label }}</span>
                <p-badge v-if="item.badge"
                         style-type="indigo100"
                         badge-type="subtle"
                         shape="round"
                >
                    {{ item.badge }}
                </p-badge>
            </span>
        </template>
    </p-select-dropdown>
</template>

<script setup lang="ts">
import {
    computed, defineProps, reactive,
} from 'vue';

import { PSelectDropdown, PBadge } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY_SYMBOL } from '@/store/modules/display/config';

import type { DashboardCurrency } from '@/services/dashboards/config';


interface DashboardCurrencySelectDropdownProps {
    currency?: DashboardCurrency;
}
const props = withDefaults(defineProps<DashboardCurrencySelectDropdownProps>(), {
    currency: undefined,
});
const emit = defineEmits<{(e: 'update:currency', currency: DashboardCurrency): void}>();
const state = reactive({
    defaultCurrency: computed<Currency>(() => store.state.display.currency),
    currency: computed(() => props.currency || store.state.display.currency),
    currencyItems: computed<MenuItem[]>(() => {
        const defaultMenu = {
            type: 'item',
            name: 'DEFAULT',
            label: `${CURRENCY_SYMBOL[state.defaultCurrency]}${state.defaultCurrency}`,
            badge: i18n.t('DASHBOARDS.DETAIL.DEFAULT'),
        };
        const currencyMenuItems = Object.keys(store.state.display.currencyRates).map((currency) => ({
            type: 'item',
            name: currency,
            label: `${CURRENCY_SYMBOL[currency]}${currency}`,
        }));
        return [defaultMenu, ...currencyMenuItems];
    }),
});

const handleSelectCurrency = (currency: DashboardCurrency) => {
    emit('update:currency', currency);
};
</script>

<style lang="postcss" scoped>
.p-badge {
    margin-left: 0.25rem;
}
</style>
