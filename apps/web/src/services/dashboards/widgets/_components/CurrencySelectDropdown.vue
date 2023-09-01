<script lang="ts" setup>
import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import {
    computed,
    reactive,
} from 'vue';
import { useStore } from 'vuex';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

const props = withDefaults(defineProps<{
    printMode?: boolean;
}>(), {
    printMode: false,
});

const emit = defineEmits<{(e: 'update', value: Currency): void}>();
const store = useStore();

const state = reactive({
    currency: computed(() => store.state.settings.currency),
    currencyItems: computed<MenuItem[]>(() => Object.keys(store.state.settings.currencyRates).map((currency) => ({
        type: 'item',
        name: currency,
        label: `${CURRENCY_SYMBOL[currency]}${currency}`,
    }))),
});

const handleSelectCurrency = (currency: Currency) => {
    store.commit('settings/setCurrency', currency);
    emit('update', currency);
};

</script>

<template>
    <p-select-dropdown :items="state.currencyItems"
                       :selected="state.currency"
                       style-type="transparent"
                       :read-only="props.printMode"
                       class="currency-select-dropdown"
                       :class="{ 'print-mode': props.printMode }"
                       @select="handleSelectCurrency"
    />
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-select-dropdown */
.print-mode {
    .text {
        white-space: nowrap;
    }
}
</style>
