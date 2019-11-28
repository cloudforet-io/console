<template>
    <div ref="containerRef"
         class="bubble-chart-container"
         :class="legendPosition"
    >
        <p-chart ref="chartRef"
                 v-bind="$props" class="p-chart"
                 :style="chartStyle"
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
                    <circle v-if="d.longitude !== null"
                            v-tooltip="getTooltipOptions(d, idx, {
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
import { colorset } from '@/lib/util';

const setSizeTools = (props, context) => {
    const state = reactive({
        chartStyle: {
            width: props.legendPosition === 'left' ? '78%' : '100%',
        },
        legendContainerStyle: {
            maxHeight: props.height,
            width: props.legendPosition === 'left' ? '22%' : '100%',
        },
        containerWidth: 0,
        containerHeight: 0,
    });

    onMounted(() => {
        const clientRect = context.refs.containerRef.getBoundingClientRect();
        state.containerHeight = clientRect.height;
        state.containerWidth = clientRect.width;
    });

    return {
        ...toRefs(state),
    };
};

const setMapTools = (props, context, sizeTools) => {
    const state = reactive({
        mapFeatures: [],
        mapPath: () => {},
        circleLoc: () => {},
        chartRef: null,
    });

    const setMap = () => {
        const xy = d3.geoEquirectangular()
            .fitExtent([
                [0, 0],
                [
                    sizeTools.containerWidth.value * (props.legendPosition === 'left' ? 0.78 : 1),
                    sizeTools.containerHeight.value,
                ],
            ], countries);
        state.mapFeatures = countries.features;
        state.mapPath = d3.geoPath().projection(xy);
        state.circleLoc = xy;
    };

    onMounted(() => {
        setMap();
    });

    return {
        ...toRefs(state),
    };
};

const setDrawTools = (props, context) => {
    const state = reactive({
        rScale: null,
        chartData: [],
        colors: d3.scaleOrdinal().range(colorset),
        hoverList: [],
        hoverState: false,
    });

    const max = computed(() => _.maxBy(props.data, d => d.value).value);
    const min = computed(() => _.minBy(props.data, d => d.value).value);

    const initRScale = () => {
        state.rScale = d3.scaleLinear()
            .range([0, props.maxRadius])
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
        preserve: {
            type: [Object, Boolean],
            default: () => ({
                align: 'xMidYMid',
                meetOrSlice: 'meet',
            }),
        },
        responsive: {
            type: Boolean,
            default: false,
        },
        height: {
            type: Number,
            default: null,
        },
        maxRadius: {
            type: Number,
            default: 30,
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
        const tooltips = setTooltips(props, context);
        const sizeTools = setSizeTools(props, context);
        const mapTools = setMapTools(props, context, sizeTools);
        const drawTools = setDrawTools(props, context);
        return {
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
        width: 100%;
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
                overflow-y: auto;
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
