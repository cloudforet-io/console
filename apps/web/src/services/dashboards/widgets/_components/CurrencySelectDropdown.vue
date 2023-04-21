<template>
    <p-select-dropdown :items="currencyItems"
                       :selected="currency"
                       style-type="transparent"
                       :read-only="printMode"
                       class="currency-select-dropdown"
                       :class="{ 'print-mode': printMode }"
                       @select="handleSelectCurrency"
    />
</template>

<script lang="ts">

import {
    computed,
    reactive, toRefs,
} from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { store } from '@/store';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';

export default {
    name: 'CurrencySelectDropdown',
    components: {
        PSelectDropdown,
    },
    props: {
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            currency: computed(() => store.state.display.currency),
            currencyItems: computed<MenuItem[]>(() => Object.keys(store.state.display.currencyRates).map((currency) => ({
                type: 'item',
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
            }))),
        });

        const handleSelectCurrency = (currency) => {
            store.commit('display/setCurrency', currency);
            emit('update', currency);
        };

        return {
            ...toRefs(state),
            handleSelectCurrency,
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-select-dropdown */
.print-mode {
    .text {
        white-space: nowrap;
    }
}
</style>
