<template>
    <p-pane-layout class="p-dynamic-widget-chart">
        <p class="name-wrapper">
            <p-skeleton v-if="loading"
                        height="1rem"
                        width="80%"
            />
            <template v-else>
                <span class="name">{{ name }}</span>
                <span v-if="state.isDataGreaterThanLimit"
                      class="showing-top"
                >Showing Top {{ state.chartLimit }}</span>
            </template>
        </p>
        <p-dynamic-chart :type="state.chartType"
                         :data="state.chartData"
                         :loading="loading"
                         :value-options="schemaOptions.value_options"
                         :name-options="schemaOptions.name_options"
                         :field-handler="fieldHandler"
                         :theme="state.theme"
                         :limit="state.chartLimit"
        />
    </p-pane-layout>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { DYNAMIC_CHART_LIMIT_MAP, DYNAMIC_CHART_THEMES } from '@/data-display/dynamic/dynamic-chart/config';
import PDynamicChart from '@/data-display/dynamic/dynamic-chart/PDynamicChart.vue';
import type { DynamicChartTheme, DynamicChartType } from '@/data-display/dynamic/dynamic-chart/type';
import type {
    DynamicWidgetProps,
} from '@/data-display/dynamic/dynamic-widget/type';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';

type DynamicWidgetChartProps = Omit<DynamicWidgetProps, 'type'>;


const props = withDefaults(defineProps<DynamicWidgetChartProps>(), {
    index: 0,
    name: '',
    schemaOptions: () => ({}),
    loading: false,
    viewOptions: () => ({}),
});

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
