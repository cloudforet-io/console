<template>
    <p-widget-layout :title="title" class="service-summary">
        <router-link class="count" :to="to" :style="{
            color: countColor,
        }"
        >
            <animated-number :value="count"
                             :format-value="countFormatter"
                             :duration="1500"
                             :round="1"
                             easing="easeInOutSine"
            />
        </router-link>
        <p-chart-loader :loading="loading" class="line-chart">
            <template #loader>
                &zwnj;
            </template>
            <canvas ref="chartRef" />
        </p-chart-loader>
    </p-widget-layout>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from '@vue/composition-api';
import numeral from 'numeral';
import {
    serviceSummaryProps,
    ServiceSummaryPropsType,
} from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import AnimatedNumber from 'animated-number-vue';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import { SLineChart } from '@/lib/chart/line-chart';
import { SChartToolSet } from '@/lib/chart/toolset';
import { gray } from '@/styles/colors';
import casual, { arrayOf } from '@/lib/casual';
import { fluentApi } from '@/lib/fluent-api';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import _ from 'lodash';

export default defineComponent({
    name: 'ServiceSummary',
    components: { PWidgetLayout, PChartLoader, AnimatedNumber },
    props: serviceSummaryProps,
    setup(props: ServiceSummaryPropsType) {
        interface Data {count: number}
        interface StateInterface {
            data: Data[];
            loading: boolean;
            count: number;
        }
        const ts = new SChartToolSet<SLineChart, StateInterface>(SLineChart,
            (chart: SLineChart) => chart.addData(ts.state.data, props.title)
                .setLabels(new Array(ts.state.data.length).fill(''))
                .setGradientHeight(100)
                .setLineTension(0.02)
                .setColors([props.color])
                .apply(), {
                data: [],
                loading: true,
                count: 0,
            });


        interface Value {
            count: number;
        }
        const countApi = computed(() => props.getAction(fluentApi.statisticsTest().resource().stat<Value>()
            .setCount('count')));

        // const trendApi = fluentApi.statisticsTest().history()
        const getData = async (): Promise<void> => {
            ts.state.loading = true;
            ts.state.data = [];
            try {
                const res = await countApi.value.execute();
                ts.state.count = res.data.results[0]?.count || 0;
                // TODO: trends api
                ts.state.data = _.fill(_.range(7), 0);
            } catch (e) {
                console.error(e);
                ts.state.count = 0;
                ts.state.data = _.fill(_.range(7), 0);
            } finally {
                ts.state.loading = false;
            }
        };

        setTimeout(() => {
            getData();
        }, 1000);

        return {
            ...toRefs(ts.state),
            countColor: computed(() => (ts.state.loading ? gray[500] : props.color)),
            countFormatter(val): string {
                return val < 10000 ? val : numeral(val).format('0.0a');
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
.service-summary::v-deep .widget-contents {
    padding: 0;
}
.count {
    display: inline-block;
    line-height: 3rem;
    font-size: 2.5rem;
    font-weight: bold;
    margin-left: 1.5rem;
    border-bottom-width: 1px;
    border-color: transparent;
    &:hover {
        border-color: currentColor;
    }
}
.line-chart {
    height: 6.25rem;
}
</style>
