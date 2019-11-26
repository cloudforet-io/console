<template>
    <div class="hs-chart-container">
        <p-chart v-bind="$props"
                 :options="chartOptions"
                 :min-height="chartHeight" :max-height="chartHeight"
                 @ready="draw"
                 @resize="resizeElements"
        >
            <g v-for="(cd, ci) in chartData" :key="cd.key"
               class="horizontal-stack-bar-g"
               :data-key="cd.key"
               :style="{ fill: colors(ci) }"
            >
                <g v-for="(d, idx) in cd" ref="bar"
                   :key="cd.key + idx"
                   :style="{ opacity: !hoverState || hoverList[ci] ? 1.0 : 0.3 }"
                   @mouseenter="onMouseEnter(ci)"
                   @mouseleave="resetHoverList"
                >
                    <rect v-tooltip="{
                              ...getTooltipOptions({key: keys[ci], value: data[keys[ci]]}, ci),
                              trigger: 'manual',
                              show: hoverList[ci],
                          }"
                          class="bar"
                          :x="xScale(d[0])" :y="yScale(idx)"
                          :width="xScale(d[1] - d[0])"
                          :height="barThickness"
                          :data-idx="idx"
                    />
                    <text>
                        {{ xScale(d[0]) }}
                    </text>
                    <text class="percent-label"
                          :x="xScale((d[0] + d[1]) / 2)" :y="yScale(idx + 0.5)"
                          dominant-baseline="middle" text-anchor="middle"
                    >
                        {{ Math.round(d.data[keys[ci]] / sum * 100) }}%
                    </text>
                </g>
            </g>
        </p-chart>
        <div class="legend-container">
            <p-chart-legend v-for="(val, key, idx) in data" :key="key" class="legend"
                            :text="key" :count="val" :icon-color="colors(idx)"
                            :opacity="!hoverState || hoverList[idx] ? 1.0 : 0.3"
                            @mouseenter="onMouseEnter(idx)"
                            @mouseleave="resetHoverList"
                            @click="$emit('legendClick', key, val)"
            />
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import _ from 'lodash';
import {
    reactive, toRefs, computed,
} from '@vue/composition-api';
import { VTooltip } from 'v-tooltip';
import PChart, { setTooltips } from '@/components/molecules/charts/Chart';
import PChartLegend from '@/components/organisms/legends/ChartLegend';
import { PRIMARY_COLORSET } from '@/components/molecules/charts/Chart.map';
import { HORIZONTAL_STACK_OPTIONS } from './HorizontalStackBarChart.map';

const setDrawTools = (props, context, chartOptions) => {
    const state = reactive({
        yScale: null,
        xScale: null,
        sum: computed(() => d3.sum(Object.values(props.data))),
        keys: computed(() => Object.keys(props.data)),
        chartHeight: computed(() => state.barThickness),
        chartData: null,
        hoverList: [],
        hoverState: false,
        colors: d3.scaleOrdinal().range(PRIMARY_COLORSET),
        barThickness: computed(() => chartOptions.value.bars.thickness),
        labels: null,
        visibleLabels: [],
    });

    const initYScale = (svgTools) => {
        svgTools.setChartHeight(state.chartHeight);
        state.yScale = d3.scaleLinear()
            .rangeRound([0, state.chartHeight])
            .domain([0, 1]);
    };
    const initXScale = (svgTools) => {
        state.xScale = d3.scaleLinear()
            .range([0, svgTools.chartWidth.value])
            .domain([0, state.sum]);
    };

    const setLabelVisibility = () => {
        context.refs.bar.forEach((bar) => {
            const rect = bar.firstElementChild;
            const label = bar.lastElementChild;
            label.style.visibility = rect.getAttribute('width') > label.getBoundingClientRect().width ? 'visible' : 'hidden';
        });
    };

    const resetHoverList = () => {
        state.hoverState = false;
        state.hoverList = new Array(state.keys.length).fill(false);
    };
    const drawEmptyBar = () => {

    };

    const draw = async (svgTools) => {
        if (!state.sum) {
            drawEmptyBar();
            return;
        }
        initYScale(svgTools);
        initXScale(svgTools);
        resetHoverList();
        state.chartData = d3.stack().keys(state.keys)([props.data]);
        context.root.$nextTick(() => { setLabelVisibility(); });
    };

    const onMouseEnter = (idx) => {
        state.hoverState = true;
        state.hoverList.splice(idx, 1, true);
    };

    const resizeElements = (svgTools) => {
        initXScale(svgTools);
        setLabelVisibility();
    };

    return {
        ...toRefs(state),
        draw,
        resizeElements,
        onMouseEnter,
        resetHoverList,
    };
};

export default {
    name: 'PHorizontalStackBarChart',
    events: ['legendClick'],
    components: { PChart, PChartLegend },
    directives: { tooltip: VTooltip },
    props: {
        loading: {
            type: Boolean,
            default: undefined,
        },
        data: {
            type: Object,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, context) {
        const chartOptions = computed(() => _.merge({}, HORIZONTAL_STACK_OPTIONS, props.options));
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
    .hs-chart-container {
        width: 100%;
    }
    .horizontal-stack-bar-g {
        .percent-label {
            font-size: 14px;
            fill: $white;
        }
    }
</style>

<style lang="scss" scoped>
    .legend-container {
        display: flex;
        flex-wrap: wrap;
        .legend {
            padding-top: 1rem;
            padding-right: 2rem;
        }
    }
</style>
