<template>
    <p-widget-layout :title="title" :padding="false">
        <router-link class="count" :to="to" :style="{
            color: color,
        }"
        >
            {{ count | numbers }}
        </router-link>
        <p-chart-loader :loading="loading" class="line-chart">
            <canvas ref="chartRef" />
        </p-chart-loader>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, defineComponent, toRefs,
} from '@vue/composition-api';
import numeral from 'numeral';
import {
    serviceSummaryProps,
    ServiceSummaryPropsType,
} from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import { SLineChart } from '@/lib/chart/line-chart';
import { SChartToolSet } from '@/lib/chart/toolset';

// TODO: browser tooltip for exact count
export default defineComponent({
    name: 'ServiceSummary',
    filters: {
        numbers(val): string {
            return val < 10000 ? val : numeral(val).format('0.0a');
        },
    },
    components: { PWidgetLayout, PChartLoader },
    props: serviceSummaryProps,
    setup(props: ServiceSummaryPropsType) {
        const ts = new SChartToolSet<SLineChart>(SLineChart,
            (chart: SLineChart) => chart.addData(props.data, props.title)
                .setLabels(new Array(props.data.length).fill(''))
                .setGradientHeight(100)
                .setColors([props.color])
                .apply());

        return {
            ...toRefs(ts.state),
            count: computed(() => props.data[props.data.length - 1]),
        };
    },
});
</script>

<style lang="postcss" scoped>
.count {
    display: inline-block;
    line-height: 2.5rem;
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
    height: 100px;
}
</style>
