<template>
    <p-loading-box :loading="loading">
        <canvas ref="chartRef" />
    </p-loading-box>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import Chart, {
    ChartDataSets, ChartLineOptions, ChartOptions,
} from 'chart.js';
import { lineChartProps, LineChartPropsType } from '@/components/organisms/charts/line-chart/LineChart.toolset';
import { colorset } from '@/lib/util';
import { dark } from '@/styles/colors';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PLoadingBox from '@/components/organisms/loading-box/LoadingBox.vue';


const simpleSettings: ChartDataSets = {
    borderWidth: 1,
    fill: false,
};

const multiSettings: ChartDataSets | ChartLineOptions = {
    ...simpleSettings,
    borderWidth: 2,
    lineTension: 0,
    pointRadius: 0,
};

const settings = {
    simple: simpleSettings,
    multi: multiSettings,
};

const simpleOptions: ChartOptions = {
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        yAxes: [{
            gridLines: {
                display: false,
            },
            ticks: {
                beginAtZero: true,
                display: false,
            },
        }],
        xAxes: [{
            gridLines: {
                display: false,
            },
        }],
    },
    tooltips: {
        cornerRadius: 2,
        caretSize: 6,
        caretPadding: 8,
        displayColors: false,
        backgroundColor: dark,
    },
};

const multiOptions: ChartOptions = {
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        yAxes: [{
            gridLines: {
                display: true,
            },
            ticks: {
                beginAtZero: true,
                display: true,
            },
        }],
        xAxes: [{
            gridLines: {
                display: true,
            },
            ticks: {
                autoSkip: true,
                autoSkipPadding: 50,
            },
        }],
    },
    tooltips: {
        ...simpleOptions.tooltips,
        mode: 'point',
    },
};

const options = {
    simple: simpleOptions,
    multi: multiOptions,
};

export default defineComponent({
    name: 'LineChart',
    props: lineChartProps,
    components: { PLoadingBox },
    setup(props: LineChartPropsType) {
        const chartRef: any = ref(null);

        const state: any = reactive({
            datasets: computed(() => props.dataset.map((d, i) => ({
                label: d.label,
                data: d.data,
                backgroundColor: props.color || colorset[i],
                borderColor: props.color || colorset[i],
                ...settings[props.styleType],
            }))),
            options: computed(() => options[props.styleType]),
        });

        const initChart = () => new Chart(chartRef.value, {
            type: 'line',
            data: {
                labels: props.labels,
                datasets: state.datasets,
            },
            options: state.options,
        });

        watch(() => chartRef.value, (val) => {
            if (val) initChart();
        });

        return {
            chartRef,
        };
    },
});
</script>

<style lang="postcss" scoped>
</style>
