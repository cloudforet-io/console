<template>
    <div class="bubble-chart-container"
         :class="legendPosition"
         :style="chartContainerStyle"
    >
        <p-chart ref="chartRef"
                 v-bind="$props" class="p-chart"
                 :options="chartOptions"
                 :style="{
                     minWidth: `${chartMinWidth}px`
                 }"
                 @ready="draw"
        >
            <g>
                <path v-for="(feature, idx) in mapFeatures"
                      :key="idx"
                      class="map-path"
                      :d="mapPath(feature, idx)"
                />
            </g>
            <g>
                <g v-for="(d, idx) in chartData" :key="d.key">
                    <circle v-tooltip="getTooltipOptions(d, idx, {
                                content: generateTooltipTitle(d, idx, colors(idx))
                            })"
                            :cx="circleLoc([d.longitude, d.latitude])[0]"
                            :cy="circleLoc([d.longitude, d.latitude])[1]"
                            :r="rScale(d.value)"
                            :style="{ fillOpacity: hoverList[idx] ? 1.0 : 0.3,
                                      fill: colors(idx),
                                      stroke: colors(idx),
                                      strokeWidth: 1,
                            }"
                            @mouseover="onMouseEnter(idx)"
                            @mouseout="resetHoverList"
                    />
                </g>
            </g>
        </p-chart>
        <div class="legend-container"
             :style="legendContainerStyle"
        >
            <p-chart-legend v-for="(d, idx) in data" :key="d.key" class="legend"
                            :text="d.key" :count="d.value" :icon-color="colors(idx)"
                            :opacity="!hoverState || hoverList[idx] ? 1.0 : 0.3"
                            @mouseenter="onMouseEnter(idx)"
                            @mouseleave="resetHoverList"
                            @click="$emit('legendClick', d.key, d.value)"
            />
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import _ from 'lodash';
import {
    reactive, toRefs, computed, onMounted,
} from '@vue/composition-api';
import { VTooltip } from 'v-tooltip';
import PChart, { setTooltips } from '@/components/molecules/charts/Chart';
import PChartLegend from '@/components/organisms/legends/ChartLegend';
import countries from './countries.json';
import { BUBBLE_OPTIONS } from './BubbleChart.map';
import { PRIMARY_COLORSET } from '@/components/molecules/charts/Chart.map';

const setSizeTools = (props, context, chartOptions) => {
    const state = reactive({
        chartMinWidth: null,
        chartContainerStyle: {
            maxHeight: props.maxHeight && props.legendPosition === 'left' ? `${props.maxHeight}px` : null,
            width: '100%',
            height: props.height ? `${props.height}px` : null,
        },
        legendContainerStyle: {
            maxHeight: null,
            width: null,
        },
    });

    onMounted(() => {
        const clientRect = context.refs.chartRef.$el.getBoundingClientRect();
        if (props.legendPosition === 'left') {
            state.chartMinWidth = clientRect.width * 0.78;
            state.legendContainerStyle.width = `${clientRect.width * 0.22}px`;
            state.legendContainerStyle.maxHeight = props.legendPosition === 'left' ? `${clientRect.height}px` : null;
        }
    });

    return {
        ...toRefs(state),
    };
};

const setMapTools = (props, context, chartOptions) => {
    const state = reactive({
        mapFeatures: [],
        mapPath: () => {},
        circleLoc: () => {},
        chartRef: null,
    });

    const setMap = () => {
        const clientRect = state.chartRef.$el.getBoundingClientRect();
        const xy = d3.geoEquirectangular()
            .fitExtent([
                [0, 0],
                [clientRect.width * 0.78, clientRect.height],
            ], countries);
        state.mapFeatures = countries.features;
        state.mapPath = d3.geoPath().projection(xy);
        state.circleLoc = xy;
    };

    onMounted(() => { setMap(); });

    return {
        ...toRefs(state),
    };
};

const setDrawTools = (props, context, chartOptions) => {
    const state = reactive({
        rScale: d3.scaleLinear().range([0, chartOptions.value.maxRadius]),
        chartData: [],
        colors: d3.scaleOrdinal().range(PRIMARY_COLORSET),
        hoverList: [],
        hoverState: false,
    });

    const maxRadius = computed(() => chartOptions.value.bubble.maxRadius);
    const max = computed(() => _.maxBy(props.data, d => d.value).value);
    const min = computed(() => _.minBy(props.data, d => d.value).value);

    const initRScale = () => {
        state.rScale = d3.scaleLinear()
            .range([0, maxRadius.value])
            .domain([min.value, max.value]);
    };

    const resetHoverList = () => {
        state.hoverState = false;
        state.hoverList = new Array(props.data.length).fill(false);
    };

    const draw = () => {
        initRScale();
        resetHoverList();
        state.chartData = props.data;
    };

    const onMouseEnter = (idx) => {
        state.hoverState = true;
        state.hoverList.splice(idx, 1, true);
    };


    return {
        ...toRefs(state),
        draw,
        onMouseEnter,
        resetHoverList,
    };
};

export default {
    name: 'BubbleChart',
    events: ['legendClick'],
    components: { PChart, PChartLegend },
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
        height: {
            type: Number,
            default: null,
        },
        /**
         * @name maxHeight
         * @description it doesn't work when the legendPosition is 'bottom'
         */
        maxHeight: {
            type: Number,
            default: null,
        },
        legendPosition: {
            type: String,
            default: 'left',
            validator: lp => ['left', 'bottom'].includes(lp),
        },
    },
    setup(props, context) {
        const chartOptions = computed(() => _.merge({}, BUBBLE_OPTIONS, props.options));
        const tooltips = setTooltips(props, context, chartOptions);
        const sizeTools = setSizeTools(props, context, chartOptions);
        const mapTools = setMapTools(props, context, chartOptions);
        const drawTools = setDrawTools(props, context, chartOptions);
        return {
            chartOptions,
            ...tooltips,
            ...sizeTools,
            ...mapTools,
            ...drawTools,
        };
    },
};
</script>

<style lang="scss" scoped>
    .bubble-chart-container {
        display: flex;
        .p-chart {
            overflow: hidden;
            .map-path {
                fill: $primary3;
            }
        }
        &.left {
            width: 100%;
            flex-direction: row-reverse;
            align-items: flex-end;
            .legend-container {
                padding-right: 1rem;
                overflow-y: scroll;
                .legend::v-deep {
                    display: flex;
                    justify-content: space-between;
                    .p-status {
                        max-width: calc(100% - 1.625rem);
                        justify-content: start;
                    }
                }
            }
        }
        &.bottom {
            flex-direction: column;
            .legend-container {
                padding-top: 1.5rem;
                .legend::v-deep {
                    display: inline-flex;
                    padding-right: 2rem;

                }
            }
        }
    }

</style>
