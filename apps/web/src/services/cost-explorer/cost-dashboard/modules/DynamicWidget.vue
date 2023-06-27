<template>
    <component
        :is="component"
        :widget-id="widgetId"
        :name="name"
        :options="options"
        :period="period"
        :filters="filters"
        :currency="currency"
        :currency-rates="currencyRates"
        :print-mode="printMode"
        v-on="$listeners"
    />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import { CURRENCY } from '@/store/modules/settings/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

interface Props extends WidgetProps {
    widgetId: string;
    name: string;
    widgetFileName: string;
}

export default {
    name: 'DynamicWidget',
    props: {
        widgetId: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            default: '',
        },
        widgetFileName: {
            type: String,
            default: '',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props) {
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

        (() => getComponent())();

        return {
            ...toRefs(state),
            getComponent,
        };
    },
};
</script>
