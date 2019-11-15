<template>
    <div ref="svgContainer"
         class="p-chart-container"
         :style="{
             minHeight: `${minHeight}px`,
             minWidth: `${minWidth}px`,
             maxHeight: maxHeight ? `${maxHeight}px` : null,
         }"
    >
        <svg ref="svg" />

        <Spinner v-model="isLoading"
                 :backdrop="true"
                 class="p-loading-spinner"
                 :style="{
                     minHeight: `${minHeight}px`,
                     minWidth: `${minWidth}px`,
                 }"
        />
    </div>
</template>

<script>

import * as d3 from 'd3';
import Tooltip from 'tooltip.js';
import Spinner from '@/components/base/spinner/BaseSpinner';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from './Chart.map';

export default {
    name: 'PChartD3',
    components: {
        Spinner,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
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
        noDraw: {
            type: Boolean,
            default: false,
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
            tooltipEls: {},
            colorset: PRIMARY_COLORSET,
        };
    },
    computed: {
        chartOptions() {
            return this._.merge({}, DEFAULT_OPTIONS, this.options);
        },
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
            this.setSvgViewBox();
        },
    },
    mounted() {
        this.isMounted = true;
    },
    destroyed() {
        this._.forIn(this.tooltipEls, tooltip => tooltip.dispose());
        if (this.responsiveWidthOnly) window.removeEventListener('resize', this.resizeSvg);
    },
    methods: {
        drawChart() {
            if (this.noDraw) return;
            this.initTooltips();
            this.initSvg();
            this.initXScale(); // MUST IMPLEMENT IN CHILD COMPONENT
            this.initYScale(); // MUST IMPLEMENT IN CHILD COMPONENT
            this.appendChartElements(); // MUST IMPLEMENT IN CHILD COMPONENT
        },
        initTooltips() {
            this._.forIn(this.tooltipEls, tooltip => tooltip.dispose());
            this.tooltipEls = {};
        },
        /**
             * @name appendTooltips
             * @param el            target element. essential.
             * @param contents      tooltip contents. essential.
             * @param key           unique data for target element. essential.
             * @param options       tooltip.js options. optional.
             */
        appendTooltips(data, idx, el, options) {
            if (this.tooltipEls[data.key]) return;
            const mergedOptions = this.getTooltipOptions(data, idx, el, options || {});
            this.tooltipEls[data.key] = new Tooltip(el, mergedOptions);
        },
        getTooltipOptions(data, idx, el, options) {
            return this._.merge({
                title: this.generateTooltipTitle(data, idx, options.color),
                container: this.svgContainerRef,
            }, this.chartOptions.tooltips, options);
        },
        generateTooltipTitle(data, idx, color) {
            const title = document.createElement('div');
            title.classList.add('tooltip-title');

            const circle = document.createElement('span');
            circle.classList.add('circle');
            circle.style.backgroundColor = color;

            const text = document.createElement('span');
            text.classList.add('text');
            text.innerText = `${data.key}: ${data.value}`;

            title.appendChild(circle);
            title.appendChild(text);

            return title;
        },
        initSvg() {
            if (!this.svgEl) {
                this.svgEl = d3.select(this.svgRef);
                this.setSvgResponsive();
            } else {
                this.svg.remove();
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
        .tooltip-title {
            display: flex;
            align-items: center;
            .circle {
                display: inline-block;
                height: 12px;
                width: 12px;
                border-radius: 50%;
            }
            .text {
                padding-left: 4px;
                font-size: 14px;
                color: $white;
            }
        }
    }
</style>
