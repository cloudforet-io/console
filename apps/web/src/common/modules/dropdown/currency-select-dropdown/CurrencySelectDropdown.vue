<template>
    <p-select-dropdown :items="currencyItems"
                       :selected="currency"
                       style-type="transparent"
                       class="currency-select-dropdown"
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

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

export default {
    name: 'CurrencySelectDropdown',
    components: {
        PSelectDropdown,
        PBadge,
    },
    props: {
        defaultCurrencyMode: {
            type: Boolean,
            default: false,
        },
        currency: {
            type: String as PropType<Currency>,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const DEFAULT_CURRENCY = CURRENCY.USD;
        const state = reactive({
            currency: computed(() => props.currency || store.state.settings.currency || DEFAULT_CURRENCY),
            currencyItems: computed<MenuItem[]>(() => Object.keys(store.state.settings.currencyRates).map((currency) => ({
                type: 'item',
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
                badge: currency === DEFAULT_CURRENCY ? i18n.t('DASHBOARDS.DETAIL.DEFAULT') : '',
            }))),
        });

        const handleSelectCurrency = (currency: Currency) => {
            store.commit('settings/setCurrency', currency);
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
.p-badge {
    margin-left: 0.25rem;
}
</style>
