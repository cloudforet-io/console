<template>
    <p-widget-layout title="History">
        <p-chart-loader :loading="loading" class="chart">
            <template #loader>
                <p-skeleton width="100%" height="100%" />
            </template>
            <canvas ref="chartRef" />
        </p-chart-loader>
        <template #extra>
            <span v-for="(legend) in legends" :key="legend.name" class="legend">
                <span class="color" :style="{color: legend.color}" />
                {{ legend.name }}
            </span>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, Ref, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import { coral, gray, primary } from '@/styles/colors';
import _ from 'lodash';
import { SChartToolSet } from '@/lib/chart/toolset';
import { SBarChart } from '@/lib/chart/bar-chart';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import moment from 'moment';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import { HistoryStat } from '@/lib/fluent-api/statistics/history';

interface Data {
    date: string;
    success: number;
    failure: number;
}

interface Props {
    getAction: (api: HistoryStat<Data>) => HistoryStat<Data>;
}

export default {
    name: 'SCollectionHistory',
    components: {
        PWidgetLayout,
        PChartLoader,
        PSkeleton,
    },
    props: {
        getAction: {
            type: Function,
            default: api => api,
        },
    },
    setup(props: Props) {
        interface DataType {
            date: string;
            success: number;
            failure: number;
        }
        interface InitDataType {
            data: Array<DataType | undefined>;
            loading: boolean;
            colors: Ref<Readonly<string[]>>;
        }
        const LEGEND_COLORS: {[k: string]: string} = {
            success: primary,
            failure: coral.default,
        };

        const ts = new SChartToolSet<SBarChart, InitDataType>(SBarChart,
            (chart: SBarChart) => (chart.addData(ts.state.data.map(d => d.success), 'Success')
                .addData(ts.state.data.map(d => d.failure), 'Failure')
                .setLabels(ts.state.data.map(d => moment(d.date).format('MM/DD')))
                .setColors(ts.state.colors)
                .setTicksCount(5)
                .apply()), {
                data: [],
                loading: true,
                colors: computed(() => _.map(LEGEND_COLORS, v => (ts.state.loading ? gray[500] : v))),
            });


        const api = fluentApi.statisticsTest().history().stat<Data>()
            .setTopic('daily_job_summary')
            .addGroupKey('created_at', 'date')
            .addGroupField('success', STAT_OPERATORS.sum, 'values.success_count')
            .addGroupField('failure', STAT_OPERATORS.sum, 'values.fail_count')
            .setFilter({ key: 'created_at', value: 'now/d-8d', operator: FILTER_OPERATOR.gtTime });

        const getData = async (): Promise<void> => {
            ts.state.loading = true;
            ts.state.data = [];
            try {
                const res = await props.getAction(api).execute();
                ts.state.data = _.sortBy(res.data.results, 'date');
            } catch (e) {
                console.error(e);
            } finally {
                ts.state.loading = false;
            }
        };

        getData();

        return {
            ...toRefs(ts.state),
            legends: computed(() => _.chain(LEGEND_COLORS)
                .map((v, k) => ({ name: k, color: v }))
                .reverse()
                .value()),
        };
    },
};
</script>

<style lang="postcss" scoped>
.chart {
    height: 254px;
}
.legend {
    @apply uppercase ml-6 inline-flex items-center float-right;
    font-size: 0.875rem;
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
