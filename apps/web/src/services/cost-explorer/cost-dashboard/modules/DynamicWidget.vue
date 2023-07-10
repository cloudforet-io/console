<script lang="ts" setup>
import {
    computed, reactive, useAttrs,
} from 'vue';

import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates } from '@/store/modules/settings/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

interface Props extends WidgetProps {
    widgetId: string;
    name: string;
    widgetFileName: string;
}

const props = withDefaults(defineProps<Props>(), {
    widgetId: '',
    name: '',
    widgetFileName: '',
    options: () => ({}),
    period: () => ({}),
    filters: () => ({}),
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    printMode: false,
});
const attrs = useAttrs();

// noinspection TypeScriptCheckImport
const state = reactive({
    component: null as any,
    loader: computed<() => Promise<any>>(() => () => import(`./../../widgets/${props.widgetFileName}.vue`)) as unknown as () => Promise<any>,
});

const getComponent = async () => {
    try {
        await state.loader();

        // TODO: throw new Error(`[] Unacceptable Layout: layout type must be one of ${...}. ${props.widgetId} is not acceptable.`);
        state.component = async () => state.loader();
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const listeners = {
    ...attrs,
};

(() => getComponent())();

</script>

<template>
    <component
        :is="state.component"
        :widget-id="widgetId"
        :name="name"
        :options="options"
        :period="period"
        :filters="filters"
        :currency="currency"
        :currency-rates="currencyRates"
        :print-mode="printMode"
        v-on="listeners"
    />
</template>
