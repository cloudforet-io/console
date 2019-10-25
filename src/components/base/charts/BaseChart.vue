<template>
    <canvas ref="chart" :height="height" :width="width" />
</template>

<script>
import Chart from 'chart.js';

const DefaultExternals = {
    moment: 'moment',
};

const DefaultOptions = {
    layout: {
        padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
    },
    legend: {
        display: true,
        position: 'top',
        labels: {
            usePointStyle: true,
            boxWidth: 10,
            padding: 20,
        },
    },
};

export default {
    name: 'BaseChart',
    props: {
        type: {
            type: String,
            default: 'doughnut',
        },
        data: {
            type: Object,
            required: true,
        },
        externals: {
            type: Object,
            default: () => ({}),
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        plugins: {
            type: Array,
            default: () => ([{}]),
        },
        height: {
            type: Number,
            default: 100,
        },
        width: {
            type: Number,
            default: 150,
        },
    },
    data() {
        return {
            chart: null,
        };
    },
    computed: {
        chartExternals() {
            return { ...DefaultExternals, ...this.externals };
        },
        chartOptions() {
            return { ...DefaultOptions, ...this.options };
        },
        chartPlugins() {
            return [{
                beforeDraw: this.beforeDraw,
                beforeInit: this.beforeChartInit,
            }, ...this.plugins];
        },
    },
    mounted() {
        this.drawChart();
    },
    methods: {
        mergeChartOptions() {
            return { ...DefaultOptions, ...this.options };
        },
        drawChart() {
            const canvas = this.$refs.chart;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.chart = new Chart(ctx, this.getChartConfig());
            } else {
                throw new Error('Browser does not support canvas.');
            }
        },
        updateChart() {
            Object.assign(this.chart, this.getChartConfig());
            this.chart.update();
        },
        getChartConfig() {
            return {
                type: this.type,
                data: this.getChartData(),
                options: this.chartOptions,
                plugins: this.chartPlugins,
                externals: this.chartExternals,
            };
        },
        getChartData() {
            return this.data;
        },
        beforeDraw(chart) {
            const { options } = chart;
            if (options.centerText && options.centerText.display) {
                this.drawCenterText(chart);
            }
        },
        beforeChartInit(chart) {
            const { options } = chart;
            if (options.legendPad) {
                this.setLegendPad(chart, options.legendPad);
            }
        },
        setLegendPad(chart, padOptions) {
            chart.legend.afterFit = function () {
                this.height = this.height + (padOptions.bottom || 0);
            };
        },
        drawCenterText(chart) {
            const { ctx } = chart;
            ctx.restore();
            this.setCenterTextFont(ctx, chart);
            this.setCenterTextLocation(ctx, chart);
            ctx.save();
        },
        setCenterTextFont(ctx, chart) {
            const fontSize = chart.options.centerText.fontSize || 16;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textBaseline = 'middle';
        },
        setCenterTextLocation(ctx, chart) {
            const { top } = chart.chartArea;
            const { bottom } = chart.chartArea;
            const { right } = chart.chartArea;
            const { left } = chart.chartArea;

            const { text } = chart.options.centerText;
            const textX = Math.round((left + right - ctx.measureText(text).width) / 2);
            const textY = (bottom + top) / 2;

            ctx.fillText(text, textX, textY);
        },
    },
};
</script>

<style lang="scss" scoped>

</style>
