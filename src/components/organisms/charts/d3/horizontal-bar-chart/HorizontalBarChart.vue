<template>
    <p-chart v-bind="$props"
             @ready="draw" @resize="resizeElements"
    >
        <g v-for="(d, idx) in chartData" :key="d.key"
           class="horizontal-bar-g"
           :class="{hover: hoverList[idx]}"
           @mouseenter="onMouseEnter(idx)"
           @mouseleave="onMouseLeave(idx)"
           @click="$emit('legendClick', d.key, d.value)"
        >
            <rect class="container mx-auto" :class="{hover: hoverList[idx]}"
                  x="0" :y="yScale(d.key) + textPadTop - 2"
                  :height="hoverBarHeight" :width="xScale(max)"
            />
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
            <rect v-tooltip="getTooltipOptions(d, idx, { color: barColor })"
                  class="bar"
                  :rx="round" :ry="round"
                  x="0" :y="yScale(d.key) + barPosY"
                  :height="barThickness"
                  :width="xScale(d.value)"
            />
        </g>
    </p-chart>
</template>


<script>
import * as d3 from 'd3';
import {
    reactive, toRefs, computed,
} from '@vue/composition-api';
import { VTooltip } from 'v-tooltip';
import PChart, { setTooltips } from '@/components/molecules/charts/ChartD3.vue';
import colorStyles from '@/styles/colors';

const LABELS = {
    PAD: { TOP: 8, BOTTOM: 4 },
    HEIGHT: 14,
};
const BARS = {
    THICKNESS: 8,
    HEIGHT: 14,
    COLOR: colorStyles.primary1,
};

const setDrawTools = (props, context) => {
    const state = reactive({
        yScale: null,
        xScale: null,
        chartData: null,
        barGroup: null,
        hoverList: [],
        max: computed(() => d3.max(props.data, d => d.value) || 1),
        textPadTop: LABELS.PAD.TOP,
        textPadBottom: LABELS.PAD.BOTTOM,
        textHeight: LABELS.HEIGHT,
        barThickness: BARS.THICKNESS,
        barColor: BARS.COLOR,
        hoverBarHeight: 0,
    });

    const initYScale = (svgTools) => {
        const bandWidth = state.textHeight + state.textPadTop + state.textPadBottom + state.barThickness;

        state.hoverBarHeight = bandWidth - state.textPadTop;

        svgTools.setChartHeight(props.data.length * bandWidth);

        state.yScale = d3.scaleBand()
            .range([0, svgTools.chartHeight.value])
            .domain(props.data.map(d => d.key));
    };

    const initXScale = (svgTools) => {
        d3.scaleLinear().range([0, svgTools.chartWidth.value]).domain([0, state.max]);
        state.xScale = d3.scaleLinear().range([0, svgTools.chartWidth.value]).domain([0, state.max]);
    };

    const draw = (svgTools) => {
        initYScale(svgTools);
        initXScale(svgTools);
        state.hoverList = new Array(props.data.length).fill(false);
        state.chartData = props.data;
    };

    const barPosY = computed(() => state.textHeight + state.textPadTop + state.textPadBottom);
    const round = computed(() => state.barThickness / 2);

    const onMouseEnter = (idx) => {
        state.hoverList.splice(idx, 1, true);
    };

    const onMouseLeave = (idx) => {
        state.hoverList.splice(idx, 1, false);
    };


    const resizeElements = (svgTools) => {
        initXScale(svgTools);
    };

    return {
        ...toRefs(state),
        round,
        barPosY,
        draw,
        onMouseEnter,
        onMouseLeave,
        resizeElements,
    };
};

export default {
    name: 'PHorizontalBarChart',
    events: ['legendClick'],
    components: { PChart },
    directives: { tooltip: VTooltip },
    props: {
        loading: {
            type: Boolean,
            default: undefined,
        },
        data: {
            type: Array,
            required: true,
        },
        preserve: {
            type: [Object, Boolean],
            default: false,
        },
        responsive: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, context) {
        const tooltips = setTooltips(props, context);
        const drawTools = setDrawTools(props, context);
        return {
            ...tooltips,
            ...drawTools,
        };
    },
};
</script>

<style lang="postcss">
    .horizontal-bar-g {
        .container {
            fill: transparent;
            &.hover {
                fill: theme('colors.primary3');
            }
        }
        .key-label {
            fill: theme('colors.dark');
            font-size: 12px;
        }
        .value-label {
            fill: theme('colors.dark');
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }
        .bar {
            fill: theme('colors.primary1');
        }
        .back-bar {
            fill: theme('colors.primary3');
        }
        &.hover {
            cursor: pointer;
            .key-label {
                fill: theme('colors.primary-dark');
            }
            .bar {
                fill: theme('colors.primary-dark');
            }
        }
    }
</style>
