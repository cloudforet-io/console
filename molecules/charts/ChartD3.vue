<template>
    <div ref="svgContainer"
         class="p-chart-container"
         :style="{
             minHeight: `${minHeight}px`,
             minWidth: `${minWidth}px`,
             maxHeight: maxHeight ? `${maxHeight}px` : null,
         }"
    >
        <svg ref="svg"
             :style="{visibility: svg ? 'visible' : 'hidden' }"
        />

        <Spinner v-model="isLoading"
                 :backdrop="true"
                 class="p-loading-spinner"
                 :style="{
                     minHeight: `${minHeight}px`,
                     minWidth: `${minWidth}px`,
                 }"
        />
        <!--        <p-tooltip contents="contents" :show="true">-->
        <!--            <template #target>-->
        <!--                <button>trigger</button>-->
        <!--            </template>-->
        <!--        </p-tooltip>-->
    </div>
</template>

<script>
/**
 * TODO:
 * <CHILD COMPONENTS>
 *
 * 1. horizontal stacked bar (Servers by Type)
 *---      1) value(%) overlay
 *      2) labels custom
 *---      3) height fix
 * 2. horizontal bar (Servers by Type - sub categories)
 *---      1) border radius
 *---      2) label custom
 *---          a. label position
 *---        b. value position
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


import * as d3 from 'd3';
import Spinner from '@/components/base/spinner/BaseSpinner';
import { DEFAULT_OPTIONS } from './ChartD3.map';
import PTooltip from '@/components/molecules/tooltips/Tooltip';

export default {
    name: 'PChartD3',
    components: {
        PTooltip,
        Spinner,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: 'doughnut',
        },
        data: {
            type: Array,
            required: true,
            validator(data) {
                return data.every(d => d.key && typeof d.value === 'number');
            },
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        minHeight: {
            type: Number,
            default: 100,
        },
        minWidth: {
            type: Number,
            default: 250,
        },
        maxHeight: {
            type: Number,
            default: null,
        },
    },
    data() {
        return {
            isMounted: false,
            isLoading: this.loading,
            svg: null,
            svgEl: null,
            xScale: null,
            yScale: null,
            yScaleHeight: this.minHeight,
            xScaleWidth: this.minWidth,
            windowWidth: 0,
            widthDiff: 0,
        };
    },
    computed: {
        chartOptions() {
            return this._.merge({}, DEFAULT_OPTIONS, this.options);
        },
        max() { return d3.max(this.data, d => d.value); },
        responsiveWidthOnly() {
            return this.chartOptions.responsive.width && !this.chartOptions.responsive.height;
        },
        svgContainerRef() {
            return this.$refs.svgContainer;
        },
        svgRef() {
            return this.$refs.svg;
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
        yScaleHeight() {
            if (this.responsiveWidthOnly) this.setSvgViewBox();
        },
    },
    mounted() {
        this.isMounted = true;
    },
    destroyed() {
        if (this.responsiveWidthOnly) window.removeEventListener('resize', this.resizeSvg);
    },
    methods: {
        drawChart() {
            this.initSvg();
            this.initXScale(); // MUST IMPLEMENT IN CHILD COMPONENT
            this.initYScale(); // MUST IMPLEMENT IN CHILD COMPONENT
            this.appendChartElements(); // MUST IMPLEMENT IN CHILD COMPONENT
        },
        initSvg() {
            if (!this.svgEl) {
                this.svgEl = d3.select(this.svgRef);
                this.setSvgResponsive();
            } else {
                this.svg.remove();
                this.svg = this.svgEl.append('g');
            }
            this.svg = this.svgEl.append('g');
        },
        setSvgResponsive() {
            const responsive = this.chartOptions.responsive;
            if (this.responsiveWidthOnly) this.setSvgResponsiveWidthOnly();
            this.setSvgViewBox();

            this.setPreserveAspectRatio(responsive.preserveAspectRatio);
        },
        setSvgResponsiveWidthOnly() {
            this.setXScaleWidth();
            this.setSvgViewBox();
            this.setSvgWidth();
            window.addEventListener('resize', this.resizeSvg);
        },
        setSvgViewBox() {
            this.svgEl.attr('viewBox',
                `0 0 ${this.xScaleWidth} ${this.yScaleHeight}`);
        },
        setPreserveAspectRatio(preserve) {
            if (preserve) {
                this.svgEl.attr('preserveAspectRatio', `${preserve.align} ${preserve.meetOrSlice}`);
            } else {
                this.svgEl.attr('preserveAspectRatio', null);
            }
        },
        setXScaleWidth() {
            const svgWidth = this.svgContainerRef.getBoundingClientRect().width;
            this.xScaleWidth = svgWidth;
        },
        setSvgWidth() {
            this.svgEl.style('width', this.xScaleWidth);
        },
        resizeSvg() {
            this.setXScaleWidth();
            this.setSvgViewBox();
            this.setSvgWidth();
            this.resizeElements(); // IMPEMENT IN CHILD COMPONENT
        },
        resizeElements() {},
        initXScale() {},
        initYScale() {},
        appendChartElements() {},
    },
};
</script>

<style lang="scss">
    .p-chart-container {
        position: relative;
        width: 100%;
        height: 100%;
        svg {
            width: 100%;
        }
        .p-loading-spinner {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 99;
            width: 100%;
            height: 100%;
        }
    }
</style>
