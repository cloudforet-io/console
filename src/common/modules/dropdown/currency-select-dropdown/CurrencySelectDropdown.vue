<template>
    <p-select-dropdown :items="currencyItems"
                       :selected="currency"
                       style-type="transparent"
                       :read-only="printMode"
                       class="currency-select-dropdown"
                       :class="{ 'print-mode': printMode }"
                       @select="handleSelectCurrency"
    >
        <template v-if="defaultMode"
                  #default="{ item }"
        >
            <span>
                <span>{{ item.label }}</span>
                <p-badge v-if="item.badge"
                         style-type="primary3"
                         shape="round"
                >{{ item.badge }}</p-badge>
            </span>
        </template>
        <template v-if="defaultMode"
                  #menu-item--format="{ item }"
        >
            <span>
                <span>{{ item.label }}</span>
                <p-badge v-if="item.badge"
                         style-type="primary3"
                         shape="round"
                >
                    {{ item.badge }}
                </p-badge>
            </span>
        </template>
    </p-select-dropdown>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    reactive, toRefs,
} from 'vue';

import { PSelectDropdown, PBadge } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { store } from '@/store';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';

export default {
    name: 'CurrencySelectDropdown',
    components: {
        PSelectDropdown,
        PBadge,
    },
    props: {
        printMode: {
            type: Boolean,
            default: false,
        },
        defaultMode: {
            type: Boolean,
            default: false,
        },
        defaultCurrency: {
            type: String as PropType<Currency>,
            default: CURRENCY.USD,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            currency: props.defaultMode ? props.defaultCurrency : computed(() => store.state.display.currency),
            currencyItems: computed<MenuItem[]>(() => Object.keys(store.state.display.currencyRates).map((currency) => ({
                type: 'item',
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
                // song-lang
                badge: currency === props.defaultCurrency ? 'Default' : '',
            }))),
        });

        const handleSelectCurrency = (currency: Currency) => {
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
.p-badge {
    margin-left: 0.25rem;
}
</style>
