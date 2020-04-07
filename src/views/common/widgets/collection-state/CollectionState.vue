<template>
    <p-widget-layout title="Collection State">
        <p-dynamic-chart :dataset="dataset" type="bar"
                         :labels="labels"
                         :loading="loading"
                         :theme-props="themeProps"
                         class="chart"
        />
        <template #extra>
            <div class="flex justify-end">
                <span v-for="(color, legend) in colors" :key="legend" class="legend">
                    <span class="color" :style="{color}" />
                    {{ legend }}
                </span>
            </div>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PDynamicChart from '@/components/organisms/charts/dynamic-chart/DynamicChart.vue';
import { ChartData } from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';
import { barDefaultThemeProps } from '@/components/organisms/charts/dynamic-chart/themes/bar-chart';
import { primary, coral } from '@/styles/colors';
import _ from 'lodash';

export default defineComponent({
    name: 'CollectionState',
    components: {
        PWidgetLayout,
        PDynamicChart,
    },
    setup() {
        const state = reactive({
            data: [],
            loading: true,
            dataset: computed(() => [
                new ChartData('Success', state.data.map(d => d.success)),
                new ChartData('Failure', state.data.map(d => d.failure)),
            ]),
            labels: computed(() => state.data.map(d => d.date)),
            colors: {
                success: primary,
                failure: coral.default,
            },
            legends: computed(() => _.keys(state.colors)),
            themeProps: computed(() => ({
                ...barDefaultThemeProps,
                colors: _.values(state.colors),
            })),
        });

        const api = async () => new Promise((resolve) => {
            setTimeout(() => {
                resolve([{
                    date: '4/1', // MM/DD
                    success: 40,
                    failure: 11,
                }, {
                    date: '4/1',
                    success: 40,
                    failure: 11,
                }, {
                    date: '4/1',
                    success: 40,
                    failure: 11,
                }, {
                    date: '4/1',
                    success: 40,
                    failure: 11,
                }, {
                    date: '4/1',
                    success: 40,
                    failure: 11,
                }, {
                    date: '4/1',
                    success: 40,
                    failure: 11,
                }, {
                    date: '4/1',
                    success: 40,
                    failure: 11,
                }]);
            }, 1000);
        });

        const getData = async () => {
            state.loading = true;
            state.data = await api();
            state.loading = false;
        };

        getData();

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.chart {
    height: 254px;
    min-width: 556px;
}
.legend {
    @apply uppercase ml-6 inline-flex items-center;
    font-size: 0.875rem;
    font-family: theme('fontFamily.serif');
    font-weight: normal;
    .color {
        display: inline-block;
        width: 0.75rem;
        height: 0.75rem;
        margin-right: 0.5rem;
        border-radius: 2px;
        background-color: currentColor;
    }
}
</style>
