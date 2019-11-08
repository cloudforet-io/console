<template>
    <div class="chart-container"
         :style="{
             height: height,
             width: width,
         }"
    >
        <canvas ref="chart" class="canvas" :class="$vnode.tag"
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
 *---      2) height fix
 * 2. horizontal bar (Servers by Type - sub categories)
 *---      1) border radius
 *XXX      2) background bar
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
 * 4. hover tooltip customize
 *
 * 5. hover overal background color & hovered item color customize
 */


import Chart from 'chart.js';
import Spinner from '@/components/base/spinner/BaseSpinner';
import {
    DEFAULT_OPTIONS, PRIMARY_COLORSET, initRectangleDraw, initHover,
} from './Chart.map';

initHover(Chart);
initRectangleDraw(Chart);
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = false;

const DefaultExternals = {
    moment: 'moment',
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
        interactiveOptions() {
            return {
                onHover: this.onHover,
                onClick: this.onClick,
            };
        },
        chartOptions() {
            return this._.merge({},
                DEFAULT_OPTIONS,
                this.interactiveOptions,
                this.options);
        },
        chartPlugins() {
            return [this.plugins];
        },
        chartData() {
            return this._.merge({
                labels: [],
                datasets: this.data.datasets.map(() => ({
                    backgroundColor: PRIMARY_COLORSET,
                    borderColor: PRIMARY_COLORSET,
                })),
            },
            this.data);
        },
        chartConfig() {
            return {
                type: this.type,
                data: this.chartData,
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
            this.chart.data = this.chartData;
            this.chart.options = this.chartOptions;
            this.chart.plugins = this.chartPlugins;
            this.chart.externals = this.chartExternals;
            this.chart.update();
        },
        onHover() {
            console.log('hovered');
        },
        onClick() {
            console.log('clicked');
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
            z-index: 99;
        }
    }
</style>
