<template>
    <div class="chart-container"
         :style="{
             height: height,
             width: width,
         }"
    >
        <canvas ref="chart" class="canvas"
                :style="{visibility: chart ? 'visible' : 'hidden'}"
        />
        <Spinner v-model="isLoading"
                 :backdrop="true"
                 class="loading-spinner"
                 :style="{
                     height: height,
                     width: width,
                 }"
        />
    </div>
</template>

<script>
/**
 * TODO:
 * <CHILD COMPONENTS>
 *
 * 1. horizontal stacked bar (Servers by Type)
 *      1) value(%) overlay
 *      2) labels custom
 *      3) height fix
 * 2. horizontal bar (Servers by Type - sub categories)
 *      1) border radius
 *      2) label custom
 *          a. label position
 *          b. value position
 * 3. donut chart (Server State)
 *      1) label custom
 *      2) center text
 * 4. bubble chart (Resources by Region)
 *      1) background
 *      2) bubble position by data, by background
 *      3) label custom
 *          a. hovered label active
 *          b. label position
 *
 */

/**
 * TODO:
 * <COMPONENT'S FUNCTION>
 *
 *--- 1. lazy data loading with spinner
 *
 *--- 2. options, externals, plugins deep merge
 *
 *--- 3. auto update
 *---      1) deeply update
 *
 */


import Chart from 'chart.js';
import Spinner from '@/components/base/spinner/BaseSpinner';

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
    name: 'PChart',
    components: {
        Spinner,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
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
            type: Object,
            default: () => ({}),
        },
        height: {
            type: String,
            default: '100%',
        },
        width: {
            type: String,
            default: '100%',
        },
    },
    data() {
        return {
            chart: null,
            isMounted: false,
            isLoading: this.loading,
        };
    },
    computed: {
        ctx() {
            return this.$refs.chart ? this.$refs.chart.getContext('2d') : null;
        },
        chartExternals() {
            return this._.merge({}, DefaultExternals, this.externals);
        },
        chartOptions() {
            return this._.merge({}, DefaultOptions, this.options);
        },
        chartPlugins() {
            return [this.plugins];
        },
        chartConfig() {
            return {
                type: this.type,
                data: this.data,
                options: this.chartOptions,
                plugins: this.chartPlugins,
                externals: this.chartExternals,
            };
        },
    },
    watch: {
        loading(val) {
            if (!val && this.isMounted) this.isLoading = false;
            else this.isLoading = true;
        },
        isMounted(val) {
            if (val && !this.loading) this.isLoading = false;
            else this.isLoading = true;
        },
        isLoading(val) {
            if (!val) this.drawChart();
        },
    },
    mounted() {
        this.isMounted = true;
    },
    methods: {
        drawChart() {
            if (this.chart) this.$nextTick(() => this.updateChart());
            else this.$nextTick(() => this.createChart());
        },
        createChart() {
            if (this.ctx) {
                this.chart = new Chart(this.ctx, this.chartConfig);
            } else {
                throw new Error('Browser does not support canvas.');
            }
        },
        updateChart() {
            this.chart.data = this.data;
            this.chart.options = this.chartOptions;
            this.chart.update();
        },
    },
};
</script>

<style lang="scss" scoped>
    .chart-container {
        position: relative;
        .loading-spinner {
            position: absolute;
            left: 0;
            top: 0;
        }
    }
</style>
