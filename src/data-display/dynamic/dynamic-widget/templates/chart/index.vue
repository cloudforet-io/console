<template>
    <p-pane-layout class="p-dynamic-widget-chart">
        <p class="name">
            <p-skeleton v-if="loading" height="1rem" width="80%" />
            <template v-else>
                {{ name }}
            </template>
        </p>
        <p-dynamic-chart :type="schemaOptions.chart_type || 'COLUMN'"
                         :data="data"
                         :loading="loading"
                         :value-options="schemaOptions.value_options"
                         :name-options="schemaOptions.name_options"
                         :limit="schemaOptions.limit || 10"
                         :field-handler="fieldHandler"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    defineComponent, PropType,
    reactive, toRefs,
} from '@vue/composition-api';
import {
    DynamicWidgetFieldHandler,
    DynamicWidgetProps,
    DynamicWidgetSchemaOptions,
    DynamicWidgetViewOptions,
} from '@/data-display/dynamic/dynamic-widget/type';
import PDynamicChart from '@/data-display/dynamic/dynamic-chart/PDynamicChart.vue';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';

type DynamicWidgetChartProps = Exclude<DynamicWidgetProps, 'type'>

export default defineComponent<DynamicWidgetChartProps>({
    name: 'PDynamicWidgetChart',
    components: { PSkeleton, PPaneLayout, PDynamicChart },
    props: {
        name: {
            type: String,
            default: '',
        },
        schemaOptions: {
            type: Object as () => DynamicWidgetSchemaOptions,
            default: () => ({}),
        },
        data: {
            type: [Object, String, Number, Array],
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        viewOptions: {
            type: Object as () => DynamicWidgetViewOptions,
            default: () => ({}),
        },
        fieldHandler: {
            type: Function as PropType<DynamicWidgetFieldHandler|undefined>,
            default: undefined,
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

<style lang="postcss">
.p-dynamic-widget-chart {
    display: flex;
    flex-direction: column;
    height: 346px;
    min-width: 392px;
    padding: 1rem;
    .name {
        @apply text-gray-700;
        line-height: 1.6;
        font-size: 1rem;
        margin-bottom: 1rem;
    }
    .p-dynamic-chart {
        flex-grow: 1;
    }
}
</style>
