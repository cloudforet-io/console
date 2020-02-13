<template>
    <div class="hs-chart-container">
        <p-chart v-bind="$props"
                 :min-height="chartHeight" :max-height="chartHeight"
                 @ready="draw"
                 @resize="resizeElements"
        >
            <g v-for="(cd, ci) in chartData" :key="cd.key"
               :data-key="cd.key"
               :style="{ fill: empty ? emptyColor : colors(ci) }"
            >
                <g v-for="(d, idx) in cd" ref="bar"
                   :key="cd.key + idx"
                   :style="{ opacity: !hoverState || hoverList[ci] ? 1.0 : 0.3 }"
                   @mouseenter="onMouseEnter(ci)"
                   @mouseleave="resetHoverList()"
                >
                    <rect v-tooltip="{
                              ...getTooltipOptions({key: keys[ci], value: data[keys[ci]]}, ci),
                              trigger: 'manual',
                              show: d.data[cd.key] && hoverList[ci],
                          }"
                          class="bar"
                          :x="xScale(d[0])" :y="yScale(idx)"
                          :width="xScale(d[1] - d[0])"
                          :height="barThickness"
                          :data-idx="idx"
                          @click="$emit('legendClick', cd.key, d.data[cd.key])"
                    />
                    <text class="percent-label"
                          :class="{empty: empty}"
                          :x="xScale((d[0] + d[1]) / 2)" :y="yScale(idx + 0.5)"
                          dominant-baseline="middle" text-anchor="middle"
                    >
                        {{
                            empty ?
                                'No data to display' :
                                `${Math.round(d.data[keys[ci]] / sum * 100)}%`
                        }}
                    </text>
                </g>
            </g>
        </p-chart>
        <div class="legend-container">
            <p-chart-legend v-for="(d, idx) in sortedData" :key="d.key" class="legend"
                            :text="d.key" :count="d.val" :icon-color="colors(idx)"
                            :opacity="!hoverState || hoverList[idx] ? 1.0 : 0.3"
                            @mouseenter="onMouseEnter(idx)"
                            @mouseleave="resetHoverList"
                            @click="$emit('legendClick', d.key, d.val)"
            />
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import * as d3 from 'd3';
import {
    reactive, toRefs, computed,
} from '@vue/composition-api';
import { VTooltip } from 'v-tooltip';
import PChart, { setTooltips } from '@/components/molecules/charts/Chart.vue';
import PChartLegend from '@/components/organisms/legends/ChartLegend.vue';
import { colorset } from '@/lib/util';
import styles from '@/styles/_variables.scss';

const setDrawTools = (props, context) => {
    const state = reactive({
        yScale: null,
        xScale: null,
        sum: computed(() => d3.sum(Object.values(props.data))),
        keys: computed(() => state.sortedData.map(d => d.key)),
        chartHeight: computed(() => state.barThickness),
        chartData: null,
        hoverList: [],
        hoverState: false,
        colors: d3.scaleOrdinal().range(colorset),
        barThickness: props.thickness,
        empty: false,
        emptyColor: styles.primary3,
        sortedData: computed(() => {
            const items = _.flatMap(props.data, (d, k) => ({ key: k, val: d }));
            return _.sortBy(items, ['key']);
        }),
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
            .domain([0, state.empty ? 1 : state.sum]);
    };

    const setLabelVisibility = () => {
        context.refs.bar.forEach((bar) => {
            const rect = bar.firstElementChild;
            const label = bar.lastElementChild;
            label.style.visibility = rect.getAttribute('width') > label.getBoundingClientRect().width ? 'visible' : 'hidden';
        });
    };

    const resetHoverList = () => {
        if (state.empty) return;
        state.hoverState = false;
        state.hoverList = new Array(state.keys.length).fill(false);
    };

    const draw = async (svgTools) => {
        state.empty = !state.sum;
        initYScale(svgTools);
        initXScale(svgTools);
        resetHoverList();

        if (state.empty) {
            state.chartData = d3.stack().keys(['empty'])([{ empty: 1 }]);
        } else {
            state.chartData = d3.stack().keys(state.keys)([props.data]);
            context.root.$nextTick(() => { setLabelVisibility(); });
        }
    };

    const onMouseEnter = (idx) => {
        if (state.empty) return;
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
        preserve: {
            type: [Object, Boolean],
            default: false,
        },
        responsive: {
            type: Boolean,
            default: true,
        },
        thickness: {
            type: Number,
            default: 24,
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

<style lang="scss" scoped>
    .hs-chart-container {
        width: 100%;
        .bar {
            cursor: pointer;
        }
        .percent-label {
            font-size: .875rem;
            fill: $white;
        }
        .empty {
            font-size: 1rem;
            fill: $primary2;
            font-weight: 100;
        }
        .legend-container {
            display: flex;
            flex-wrap: wrap;
            .legend {
                margin-top: 1rem;
                margin-right: 2rem;
            }
        }
    }
</style>
