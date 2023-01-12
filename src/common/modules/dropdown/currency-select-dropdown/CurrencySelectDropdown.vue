<template>
    <p-select-dropdown :items="currencyItems"
                       :selected="currency"
                       style-type="transparent"
                       :read-only="printMode"
                       class="currency-select-dropdown"
                       :class="{ 'print-mode': printMode }"
                       @select="handleSelectCurrency"
    >
        <template v-if="defaultCurrency"
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
        <template v-if="defaultCurrency"
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
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { store } from '@/store';
import { i18n } from '@/translations';

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
        currency: {
            type: String as PropType<Currency>,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            currency: computed(() => props.currency || store.state.display.currency),
            currencyItems: computed<MenuItem[]>(() => Object.keys(store.state.display.currencyRates).map((currency) => ({
                type: 'item',
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
                badge: currency === DEFAULT_CURRENCY ? i18n.t('DASHBOARDS.DETAIL.DEFAULT') : '',
            }))),
        });
        const DEFAULT_CURRENCY = CURRENCY.USD;

        const handleSelectCurrency = (currency: Currency) => {
            store.commit('display/setCurrency', currency);
            emit('update:currency', currency);
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
