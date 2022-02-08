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
                         :field-handler="fieldHandler"
                         :theme="theme"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed,
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
import { DYNAMIC_CHART_THEMES } from '@/data-display/dynamic/dynamic-chart/config';
import { DynamicChartTheme } from '@/data-display/dynamic/dynamic-chart/type';

type DynamicWidgetChartProps = Exclude<DynamicWidgetProps, 'type'>

export default defineComponent<DynamicWidgetChartProps>({
    name: 'PDynamicWidgetChart',
    components: { PSkeleton, PPaneLayout, PDynamicChart },
    props: {
        index: {
            type: Number,
            default: 0,
        },
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
    setup(props) {
        const state = reactive({
            theme: computed<DynamicChartTheme>(() => {
                const themeIdx = props.index % DYNAMIC_CHART_THEMES.length;
                return DYNAMIC_CHART_THEMES[themeIdx];
            }),
        });

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
    > .name {
        @apply text-gray-900;
        line-height: 1.25;
        font-size: 0.875rem;
        margin-bottom: 0.75rem;
        font-weight: bold;
    }
    > .p-dynamic-chart {
        flex-grow: 1;
    }
}
</style>
