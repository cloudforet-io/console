<script lang="ts" setup>
import { PSelectDropdown, PBadge } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import {
    computed,
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

interface Props {
    printMode?: boolean;
    defaultCurrencyMode?: boolean;
    currency?: Currency;
}

const props = withDefaults(defineProps<Props>(), {
    printMode: false,
    defaultCurrencyMode: false,
    currency: undefined,
});
const emit = defineEmits<{(e: 'update:currency', value: Currency): void}>();
const { t } = useI18n();
const store = useStore();

const DEFAULT_CURRENCY = CURRENCY.USD;
const state = reactive({
    currency: computed(() => props.currency || store.state.settings.currency || DEFAULT_CURRENCY),
    currencyItems: computed<MenuItem[]>(() => Object.keys(store.state.settings.currencyRates).map((currency) => ({
        type: 'item',
        name: currency,
        label: `${CURRENCY_SYMBOL[currency]}${currency}`,
        badge: currency === DEFAULT_CURRENCY ? t('DASHBOARDS.DETAIL.DEFAULT') : '',
    }))),
});

const handleSelectCurrency = (currency: Currency) => {
    store.commit('settings/setCurrency', currency);
    emit('update:currency', currency);
};

</script>

<template>
    <p-select-dropdown :items="state.currencyItems"
                       :selected="state.currency"
                       style-type="transparent"
                       :read-only="printMode"
                       class="currency-select-dropdown"
                       :class="{ 'print-mode': printMode }"
                       @select="handleSelectCurrency"
    >
        <template v-if="defaultCurrencyMode"
                  #default="{ item }"
        >
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
        <template v-if="defaultCurrencyMode"
                  #menu-item--format="{ item }"
        >
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

<style lang="postcss" scoped>
/* custom design-system component - p-select-dropdown */
.print-mode {
    .text {
        white-space: nowrap;
    }
}
.p-badge {
    margin-left: 0.25rem;
}
</style>
