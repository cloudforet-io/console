<template>
    <p-select-dropdown :items="currencyItems"
                       :selected="currency"
                       without-outline
                       @select="handleSelectCurrency"
    />
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { PSelectDropdown } from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { store } from '@/store';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';

export default {
    name: 'CurrencySelectDropdown',
    components: {
        PSelectDropdown,
    },
    setup(props, { emit }) {
        const state = reactive({
            currency: computed(() => store.state.display.currency),
            currencyItems: computed<MenuItem[]>(() => Object.values(CURRENCY).map(currency => ({
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
.p-select-dropdown {
    background-color: transparent;
}
</style>
