<template>
    <p-chart v-bind="$props" :options="chartOptions"
             @ready="draw" @resize="resizeElements"
    >
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
            <rect v-tooltip="getTooltipOptions(d, idx, { color: barColor })"
                  class="bar"
                  :rx="round" :ry="round"
                  x="0" :y="yScale(d.key) + barPosY"
                  :height="barThickness"
                  :width="xScale(d.value)"
                  @mouseenter="onMouseEnter(idx)"
                  @mouseleave="onMouseLeave(idx)"
            />
        </g>
    </p-chart>
</template>


<script>
import _ from 'lodash';
import * as d3 from 'd3';
import {
    reactive, ref, toRefs, watch, computed,
} from '@vue/composition-api';
import { VTooltip } from 'v-tooltip';
import PChart, { setTooltips } from '@/components/molecules/charts/Chart';
import { HORIZONTAL_OPTIONS } from './HorizontalBarChart.map';

const setDrawTools = (props, context, chartOptions) => {
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
        barColor: computed(() => chartOptions.value.bars.color),
    });

    const initYScale = (svgTools) => {
        const bandWidth = state.textHeight + state.textPadTop + state.textPadBottom + state.barThickness;
        if (!chartOptions.value.responsive.height) {
            svgTools.setChartHeight(props.data.length * bandWidth);
        }
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
        // setLabelVisibility();
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
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, context) {
        const chartOptions = computed(() => _.merge({}, HORIZONTAL_OPTIONS, props.options));
        const tooltips = setTooltips(props, context, chartOptions);
        const drawTools = setDrawTools(props, context, chartOptions);
        return {
            chartOptions,
            ...tooltips,
            ...drawTools,
        };
    },
};
</script>

<style lang="scss">
    .horizontal-bar-g {
        .key-label {
            fill: $dark;
            font-size: 12px;
        }
        .value-label {
            fill: $dark;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }
        .bar {
            fill: $primary1;
        }
        .back-bar {
            fill: $primary3;
        }
        &.hover {
            .key-label {
                fill: $primary-dark;
            }
            .bar {
                fill: $primary-dark;
            }
        }
    }
</style>
