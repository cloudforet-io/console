<template>
    <p-dynamic-chart class="p-dynamic-widget-chart"
                     :type="schemaOptions.chart_type || 'COLUMN'"
                     :data="data"
                     :value-options="schemaOptions.value_options || {}"
                     :name-options="schemaOptions.name_options || {}"
                     :limit="schemaOptions.limit || 10"
    />
</template>

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs,
} from '@vue/composition-api';
import { DynamicWidgetProps } from '@/data-display/dynamic/dynamic-widget/type';
import PDynamicChart from '@/data-display/dynamic/dynamic-chart/PDynamicChart.vue';

type DynamicWidgetChartProps = Exclude<DynamicWidgetProps, 'type'>

export default defineComponent<DynamicWidgetChartProps>({
    name: 'PDynamicWidgetChart',
    components: { PDynamicChart },
    props: {
        name: {
            type: String,
            default: '',
        },
        schemaOptions: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Object, String, Number, Array],
            default: undefined,
        },
        viewOptions: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
</script>
