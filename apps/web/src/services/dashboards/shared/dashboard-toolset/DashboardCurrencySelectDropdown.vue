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
import { PSelectDropdown, PBadge } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import {
    computed, defineProps, reactive,
} from 'vue';
import { useStore } from 'vuex';

import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import type { DashboardCurrency } from '@/services/dashboards/config';


interface DashboardCurrencySelectDropdownProps {
    currency?: DashboardCurrency;
}
const props = withDefaults(defineProps<DashboardCurrencySelectDropdownProps>(), {
    currency: undefined,
});
const emit = defineEmits<{(e: 'update:currency', currency: DashboardCurrency): void}>();

const store = useStore();

const state = reactive({
    defaultCurrency: computed<Currency>(() => store.state.settings.currency),
    currency: computed(() => props.currency || store.state.settings.currency),
    currencyItems: computed<MenuItem[]>(() => {
        const defaultMenu = {
            type: 'item',
            name: 'DEFAULT',
            label: `${CURRENCY_SYMBOL[state.defaultCurrency]}${state.defaultCurrency}`,
            badge: i18n.t('DASHBOARDS.DETAIL.DEFAULT'),
        };
        const currencyMenuItems = Object.keys(store.state.settings.currencyRates).map((currency) => ({
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
/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    min-width: auto;
}
.p-badge {
    margin-left: 0.25rem;
}
</style>
