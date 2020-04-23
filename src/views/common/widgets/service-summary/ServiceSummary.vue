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
import {
    computed, defineComponent, Ref, toRefs,
} from '@vue/composition-api';
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
import { HistoryQueryAPI, HistoryResponse, OPERATORS } from '@/lib/fluent-api/statistics/toolset_origin';
import { gray } from '@/styles/colors';
import casual, { arrayOf } from '@/lib/casual';

export default defineComponent({
    name: 'ServiceSummary',
    components: { PWidgetLayout, PChartLoader, AnimatedNumber },
    props: serviceSummaryProps,
    setup(props: ServiceSummaryPropsType) {
        interface Data {count: number}
        interface StateInterface {
            data: Data[];
            loading: boolean;
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
            });


        const summaryApi: Ref<Readonly<
            HistoryQueryAPI<undefined, HistoryResponse<Data>>>
            > = computed(() => props.api
                .setLimit(7)
                .setSort('created_at')
                .addField('', OPERATORS.count, 'count')
                .setTopic('topic'));
        // .setFrom(getTimestamp(moment().subtract(7, 'day'))));

        const getData = async (): Promise<void> => {
            ts.state.loading = true;
            ts.state.data = [];
            try {
                const res = await summaryApi.value.execute();
                ts.state.data = res.data.values.map(d => d.count);
            } catch (e) {
                ts.state.data = arrayOf(7, () => casual.integer(0, 1000000));
            } finally {
                ts.state.loading = false;
            }
        };

        setTimeout(() => {
            getData();
        }, 1000);

        return {
            ...toRefs(ts.state),
            count: computed(() => ts.state.data[ts.state.data.length - 1] || 0),
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
