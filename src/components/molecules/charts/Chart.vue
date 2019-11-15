<template>
    <div ref="svgContainerRef"
         class="p-chart-container"
         :style="{
             minHeight: `${minHeight}px`,
             minWidth: `${minWidth}px`,
             maxHeight: maxHeight ? `${maxHeight}px` : null,
         }"
    >
        <svg :viewBox="svgViewBox" :width="svgWidth"
             :preserveAspectRatio="svgRatio"
        >
            <slot :svgContainerRef="svgContainerRef">
                <g v-for="(d, idx) in chartData" :key="d.key"
                   class="horizontal-bar-g"
                   :class="{hover: hoverList[idx]}"
                >
                    <text class="key-label" dominant-baseline="hanging"
                          :y="yScale(d.key) + textPadTop"
                    >
                        {{ d.key }}
                    </text>
                    <text class="value-label" dominant-baseline="hanging"
                          text-anchor="end"
                          :x="xScale(max)"
                          :y="yScale(d.key) + textPadTop"
                    >
                        {{ d.value }}
                    </text>
                    <rect class="back-bar"
                          :rx="round" :ry="round"
                          x="0" :y="yScale(d.key) + barPosY"
                          :height="barThickness"
                          :width="xScale(max)"
                    />
                    <rect class="bar"
                          :rx="round" :ry="round"
                          x="0" :y="yScale(d.key) + barPosY"
                          :height="barThickness"
                          :width="xScale(d.value)"
                          @mouseenter="onMouseEnter(idx)"
                          @mouseleave="onMouseLeave(idx)"
                    />
                </g>
            </slot>
        </svg>

        <Spinner :value="!startDraw"
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
import _ from 'lodash';
import * as d3 from 'd3';
import {
    reactive, ref, toRefs, watch, onMounted, computed, onUnmounted,
} from '@vue/composition-api';
import Spinner from '@/components/base/spinner/BaseSpinner';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from './Chart.map';
import { HORIZONTAL_OPTIONS } from '@/components/organisms/charts/horizontal-bar-chart/HorizontalBarChart.map';

const setDrawTools = (props, chartOptions, svgTools) => {
    const state = reactive({
        yScale: null,
        xScale: null,
        chartData: null,
        barGroup: null,
        hoverList: [],
        max: computed(() => d3.max(props.data, d => d.value)),
        textPadTop: computed(() => chartOptions.value.labels.padTop),
        textPadBottom: computed(() => chartOptions.value.labels.padBottom),
        textHeight: computed(() => chartOptions.value.labels.textHeight),
        barThickness: computed(() => chartOptions.value.bars.thickness),
    });

    const initYScale = () => {
        const bandWidth = state.textHeight + state.textPadTop + state.textPadBottom + state.barThickness;
        svgTools.yScaleHeight.value = props.data.length * bandWidth;
        return d3.scaleBand()
            .range([0, svgTools.yScaleHeight.value])
            .domain(props.data.map(d => d.key));
    };

    const initXScale = () => {
        d3.scaleLinear().range([0, svgTools.xScaleWidth.value]).domain([0, state.max]);
        return d3.scaleLinear().range([0, svgTools.xScaleWidth.value]).domain([0, state.max]);
    };

    watch(svgTools.startDraw, (val) => {
        if (val) {
            state.yScale = initYScale();
            state.xScale = initXScale();
            state.hoverList = new Array(props.data.length).fill(false);
            state.chartData = props.data;
        }
    });

    const barPosY = computed(() => state.textHeight + state.textPadTop + state.textPadBottom);
    const round = computed(() => state.barThickness / 2);

    const onMouseEnter = (idx) => {
        state.hoverList.splice(idx, 1, true);
    };

    const onMouseLeave = (idx) => {
        state.hoverList.splice(idx, 1, false);
    };

    return {
        ...toRefs(state),
        round,
        barPosY,
        onMouseEnter,
        onMouseLeave,
    };
};


export const setTooltips = (props, refs, chartOptions) => {
    const generateTooltipTitle = (data, idx, color) => {
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
    };

    const getTooltipOptions = (data, idx, options) => {
        const obj = _.merge({
            content: generateTooltipTitle(data, idx, PRIMARY_COLORSET[idx]),
        }, chartOptions.value.tooltips, options);
        console.log(obj);
        return obj;
    };

    return {
        getTooltipOptions,
        generateTooltipTitle,
    };
};

export const setSvg = (props, context, refs, options) => {
    const state = reactive({
        svgViewBox: null,
        svgRatio: null,
        svgWidth: '100%',
        yScaleHeight: props.minHeight,
        xScaleWidth: props.minWidth,
    });

    const responsiveWidthOnly = computed(() => options.value.responsive.width && !options.value.responsive.height);

    const setSvgViewBox = () => {
        state.svgViewBox = `0 0 ${state.xScaleWidth} ${state.yScaleHeight}`;
    };

    const setSvgWidth = () => {
        const width = refs.svgContainerRef.getBoundingClientRect().width;
        state.xScaleWidth = width;
        setSvgViewBox();
        state.svgWidth = `${state.xScaleWidth}px`;
    };

    const resizeSvg = () => {
        setSvgWidth();
        context.emit('resize');
        // if (resizeElementsFn) resizeElementsFn(); // IMPEMENT IN CHILD COMPONENT
    };

    const setPreserveAspectRatio = (preserve) => {
        if (preserve) {
            state.svgRatio = `${preserve.align} ${preserve.meetOrSlice}`;
        } else {
            state.svgRatio = null;
        }
    };

    const setSvgResponsiveWidthOnly = () => {
        setSvgWidth();
        window.addEventListener('resize', resizeSvg);
    };

    const setSvgSize = () => {
        const responsive = options.value.responsive;

        if (responsiveWidthOnly.value) setSvgResponsiveWidthOnly();

        setSvgViewBox();
        setPreserveAspectRatio(responsive.preserveAspectRatio);
    };

    onUnmounted(() => {
        if (responsiveWidthOnly.value) window.removeEventListener('resize', resizeSvg);
    });

    watch(() => state.yScaleHeight, () => {
        if (options.value.responsive.height) setSvgViewBox();
    });

    setSvgSize();

    return {
        ...toRefs(state),
    };
};

export const setDrawTrigger = (props) => {
    const state = reactive({
        isMounted: false,
        startDraw: !props.loading,
    });

    watch(() => props.loading, (val) => {
        if (!val && state.isMounted) state.startDraw = true;
        else state.startDraw = false;
    });

    watch(() => state.isMounted, (val) => {
        if (val && !props.loading) state.startDraw = true;
        else state.startDraw = false;
    });

    onMounted(() => {
        state.isMounted = true;
    });

    return {
        ...toRefs(state),
    };
};

export const setup = (props, context, refs, chartOptions) => {
    const svgState = setSvg(props, context, refs, chartOptions);
    const trigger = setDrawTrigger(props);
    const tooltips = setTooltips(props, refs, chartOptions);
    const drawTools = setDrawTools(props, chartOptions, { ...svgState, ...trigger });

    return {
        ...svgState,
        ...trigger,
        ...tooltips,
        ...drawTools,
    };
};

export default {
    name: 'PChartD3',
    components: {
        Spinner,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
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
    setup(props, context) {
        const chartRefs = reactive({
            svgContainerRef: null,
        });
        // const chartOptions = computed(() => _.merge({}, DEFAULT_OPTIONS, props.options));
        const chartOptions = computed(() => _.merge({}, DEFAULT_OPTIONS, HORIZONTAL_OPTIONS, props.options));

        const state = setup(props, context, chartRefs, chartOptions);

        return {
            ...toRefs(chartRefs),
            chartOptions,
            ...state,
        };
    },

};
</script>

<style lang="scss">
    .p-chart-container {
        position: relative;
        width: 100%;
        height: 100%;
        .p-loading-spinner {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 99;
            width: 100%;
            height: 100%;
        }
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
</style>
