<template>
    <p-widget-layout title="Collection State">
        <p-chart-loader :loading="loading" class="chart">
            <template #loader>
                <p-skeleton width="100%" height="100%" />
            </template>
            <canvas ref="chartRef" />
        </p-chart-loader>
        <template #extra>
            <span v-for="(color, legend) in colors" :key="legend" class="legend">
                <span class="color" :style="{color}" />
                {{ legend }}
            </span>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    defineComponent, toRefs, computed, Ref,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import { coral, primary, gray } from '@/styles/colors';
import _ from 'lodash';
import { SChartToolSet } from '@/lib/chart/toolset';
import { SBarChart } from '@/lib/chart/bar-chart';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import { fluentApi } from '@/lib/fluent-api';
import { OPERATORS } from '@/lib/fluent-api/statistics/toolset';
import casual, { arrayOf } from '@/lib/casual';

export default defineComponent({
    name: 'CollectionState',
    components: {
        PWidgetLayout,
        PChartLoader,
        PSkeleton,
    },
    setup() {
        interface DataType {
            date: string;
            success: number;
            failure: number;
        }
        interface InitDataType {
            data: Array<DataType | undefined>;
            loading: boolean;
            colors: {
                success: Ref<Readonly<string>>;
                failure: Ref<Readonly<string>>;
            };
        }

        const ts = new SChartToolSet<SBarChart, InitDataType>(SBarChart,
            (chart: SBarChart) => (chart.addData(ts.state.data.map(d => d.success), 'Success')
                .addData(ts.state.data.map(d => d.failure), 'Failure')
                .setLabels(ts.state.data.map(d => d.date))
                .setColors(_.values(ts.state.colors))
                .setTicksCount(5)
                .apply()), {
                data: [],
                loading: true,
                colors: {
                    success: computed(() => (ts.state.loading ? gray[500] : primary)),
                    failure: computed(() => (ts.state.loading ? gray[500] : coral.default)),
                },
            });

        interface Data {
            state: string;
            count: number;
            date: string;
        }
        const api = fluentApi.statisticsTest().history().query<Data>()
            .addField('state', OPERATORS.value, 'state')
            .addField('created_at', OPERATORS.value, 'date')
            .setLimit(7)
            .setSort('created_at')
            .setGroupBy('created_at')
            .setFilterOr(
                { key: 'state', operator: '=', value: 'FINISHED' },
                { key: 'state', operator: '=', value: 'FAILURE' },
            );

        // const api = async (): Promise<DataType[]> => new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve([{
        //             date: '4/1', // MM/DD
        //             success: 40,
        //             failure: 11,
        //         }]);
        //     }, 1000);
        // });

        const getData = async (): Promise<void> => {
            ts.state.loading = true;
            ts.state.data = [];
            try {
                const res = await api.execute();
                // res.data.values.forEach(v => {
                //     ts.state.data.push({
                //         date: v.c
                //     })
                // })
            } catch (e) {
                ts.state.data = arrayOf(7, () => ({
                    date: casual.date('MM/DD'),
                    success: casual.integer(0, 100),
                    failure: casual.integer(0, 100),
                }));
            } finally {
                ts.state.loading = false;
            }
        };

        setTimeout(() => {
            getData();
        }, 1000);

        return {
            ...toRefs(ts.state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.chart {
    height: 254px;
}
.legend {
    @apply uppercase ml-6 inline-flex items-center float-right;
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
