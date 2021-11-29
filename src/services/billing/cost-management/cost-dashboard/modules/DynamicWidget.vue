<template>
    <component :is="component"
               :options="options"
               :period="period"
               :filters="filters"
               :currency="currency"
               :currency-rates="currencyRates"
    />
</template>

<script lang="ts">
import { isEqual } from 'lodash';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { CURRENCY } from '@/store/modules/display/config';

interface Props extends WidgetProps {
    widgetId: string;
}

export default {
    name: 'DynamicWidget',
    props: {
        widgetId: {
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
    },
    setup(props: Props) {
        // noinspection TypeScriptCheckImport
        const state = reactive({
            component: null as any,
            loader: computed<() => Promise<any>>(() => () => import(`@/services/billing/cost-management/widgets/${props.widgetId}.vue`)) as unknown as () => Promise<any>,
        });

        const getComponent = async () => {
            try {
                await state.loader();

                // TODO: throw new Error(`[] Unacceptable Layout: layout type must be one of ${...}. ${props.widgetId} is not acceptable.`);
                state.component = async () => state.loader();
            } catch (e) {
                console.error(e);
            }
        };

        watch([() => props.widgetId], (aft, bef) => {
            if (!isEqual(aft, bef)) {
                getComponent();
            }
        }, { immediate: true });


        return {
            ...toRefs(state),
            getComponent,
        };
    },
};
</script>
