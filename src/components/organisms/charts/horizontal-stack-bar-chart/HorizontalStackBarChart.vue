<template>
    <div class="hs-chart-container">
        <p-chart v-bind="$props"
                 :options="chartOptions"
                 :min-height="chartHeight" :max-height="chartHeight"
                 @ready="draw"
                 @resize="resizeElements"
        >
            <template #default>
                <g v-for="(cd, ci) in chartData" :key="cd.key"
                   class="horizontal-stack-bar-g"
                   :data-key="cd.key"
                   :style="{ fill: colors(ci) }"
                >
                    <g v-for="(d, idx) in cd" ref="bar" :key="cd.key + idx"
                       :d0="d[0]" :d1="d[1]"
                       @mouseenter="onMouseEnter($event)"
                       @mouseleave="onMouseLeave"
                    >
                        <rect class="bar"
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
                            {{ Math.round(d.data[keys[ci]] / sumList[idx] * 100) }}%
                        </text>
                    </g>
                </g>
            </template>
        </p-chart>
        <div v-for="(d, i) in data" :key="i" class="legend-container">
            <div v-for="(key, idx) in keys" :key="key" class="legend">
                <span class="circle" :style="{
                    backgroundColor: colors(idx)
                }"
                />
                <span class="key">{{ key }}</span>
                <span class="value">{{ d[key] }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import _ from 'lodash';
import {
    reactive, toRefs, computed, ref, watch,
} from '@vue/composition-api';
import PChart from '@/components/molecules/charts/Chart';
import { PRIMARY_COLORSET } from '@/components/molecules/charts/Chart.map';
import { HORIZONTAL_STACK_OPTIONS } from './HorizontalStackBarChart.map';

const setDrawTools = (props, context, chartOptions) => {
    const state = reactive({
        yScale: null,
        xScale: null,
        sumList: null,
        keys: null,
        chartData: null,
        hoverList: [],
        colors: d3.scaleOrdinal().range(PRIMARY_COLORSET),
        barThickness: computed(() => chartOptions.value.bars.thickness),
        labels: null,
        visibleLabels: [],
    });

    const chartHeight = computed(() => state.barThickness * (props.data.length || 1));
    const max = computed(() => d3.max(state.sumList));

    const initComputingData = () => {
        state.sumList = props.data.map(d => d3.sum(Object.values(d)));
        state.keys = props.data[0] ? Object.keys(props.data[0]) : [];
    };

    const initYScale = (svgTools) => {
        svgTools.setChartHeight(chartHeight.value);
        state.yScale = d3.scaleLinear()
            .rangeRound([0, chartHeight.value])
            .domain([0, props.data.length]);
    };
    const initXScale = (svgTools) => {
        state.xScale = d3.scaleLinear()
            .range([0, svgTools.chartWidth.value])
            .domain([0, max.value]);
    };

    const setLabelVisibility = () => {
        context.refs.bar.forEach((bar) => {
            const rect = bar.firstElementChild;
            const label = bar.lastElementChild;
            label.style.visibility = rect.getAttribute('width') > label.getBoundingClientRect().width ? 'visible' : 'hidden';
        });
    };
    const draw = async (svgTools) => {
        initComputingData();
        initYScale(svgTools);
        initXScale(svgTools);
        state.hoverList = new Array(props.data.length);
        state.chartData = d3.stack().keys(state.keys)(props.data);
        context.root.$nextTick(() => { setLabelVisibility(); });
    };

    const onMouseEnter = (e) => {
        context.refs.bar.forEach((b) => { b.style.opacity = 0.3; });
        e.target.style.opacity = 1;
    };

    const onMouseLeave = () => {
        context.refs.bar.forEach((b) => { b.style.opacity = 1; });
    };

    const resizeElements = (svgTools) => {
        initXScale(svgTools);
        setLabelVisibility();
    };


    return {
        ...toRefs(state),
        chartHeight,
        draw,
        resizeElements,
        onMouseEnter,
        onMouseLeave,
    };
};

export default {
    name: 'PHorizontalStackBarChart',
    components: { PChart },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        data: {
            type: Array,
            required: true,
            validator(data) {
                return data.every(d => Object.values(d).every(v => typeof v === 'number'));
            },
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        minWidth: {
            type: Number,
            default: 400,
        },
    },
    setup(props, context) {
        const chartOptions = computed(() => _.merge({}, HORIZONTAL_STACK_OPTIONS, props.options));
        const drawTools = setDrawTools(props, context, chartOptions);
        return {
            chartOptions,
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
            padding-top: 16px;
            padding-right: 32px;
            vertical-align: middle;
            .circle {
                display: inline-block;
                height: 12px;
                width: 12px;
                border-radius: 50%;
            }
            .key {
                padding-left: 8px;
                font-size: 14px;
            }
            .value {
                padding-left: 8px;
                font-size: 14px;
                font-weight: bold;
            }
        }
    }
</style>
