<template>
    <p-pane-layout class="p-dynamic-widget-chart">
        <p class="name-wrapper">
            <p-skeleton v-if="loading"
                        height="1rem"
                        width="80%"
            />
            <template v-else>
                <span class="name">{{ name }}</span>
                <span v-if="isDataGreaterThanLimit"
                      class="showing-top"
                >Showing Top {{ chartLimit }}</span>
            </template>
        </p>
        <p-dynamic-chart :type="chartType"
                         :data="chartData"
                         :loading="loading"
                         :value-options="schemaOptions.value_options"
                         :name-options="schemaOptions.name_options"
                         :field-handler="fieldHandler"
                         :theme="theme"
                         :limit="chartLimit"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    reactive, toRefs,
} from 'vue';

import { DYNAMIC_CHART_LIMIT_MAP, DYNAMIC_CHART_THEMES } from '@/data-display/dynamic/dynamic-chart/config';
import PDynamicChart from '@/data-display/dynamic/dynamic-chart/PDynamicChart.vue';
import type { DynamicChartTheme, DynamicChartType } from '@/data-display/dynamic/dynamic-chart/type';
import type {
    DynamicWidgetFieldHandler,
    DynamicWidgetProps,
    DynamicWidgetSchemaOptions,
    DynamicWidgetViewOptions,
} from '@/data-display/dynamic/dynamic-widget/type';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';

type DynamicWidgetChartProps = Exclude<DynamicWidgetProps, 'type'>;

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
            chartData: computed<any[]>(() => {
                if (Array.isArray(props.data)) return props.data;
                if (props.data === undefined || props.data === null) return [];
                return [props.data];
            }),
            chartType: computed<DynamicChartType>(() => props.schemaOptions.chart_type || 'COLUMN'),
            chartLimit: computed<number|undefined>(() => DYNAMIC_CHART_LIMIT_MAP[state.chartType]),
            isDataGreaterThanLimit: computed<boolean>(() => {
                if (state.chartLimit === undefined) return false;
                return state.chartData.length > state.chartLimit;
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
    > .name-wrapper {
        display: flex;
        align-items: flex-start;
        margin-bottom: 0.75rem;
        line-height: 1.25rem;
        > .name {
            @apply text-gray-900;
            flex-grow: 1;
            font-weight: bold;
            font-size: 0.875rem;
        }
        > .showing-top {
            @apply text-gray-500;
            flex-shrink: 0;
            font-size: 0.75rem;
        }
    }
    > .p-dynamic-chart {
        flex-grow: 1;
    }
}
</style>
