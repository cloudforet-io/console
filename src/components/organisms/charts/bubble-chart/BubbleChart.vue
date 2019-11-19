<template>
    <div class="bubble-chart-container"
         :class="legendPosition"
         :style="{maxHeight: maxHeight ? `${maxHeight}px` : null }"
    >
        <p-chart v-bind="$props" class="p-chart"
                 :options="chartOptions"
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
                            :style="{ fillOpacity: 0.3,
                                      fill: colors(idx),
                                      stroke: colors(idx),
                                      strokeWidth: 1,
                            }"
                            @mouseover="onMouseEnter"
                            @mouseout="onMouseLeave"
                    />
                </g>
            </g>
        </p-chart>
        <div class="legend-container"
             :style="{maxHeight: maxHeight ? `${maxHeight}px` : null }"
        >
            <p-chart-legend v-for="(d, idx) in data" :key="d.key" class="legend"
                            :text="d.key" :count="d.value" :icon-color="colors(idx)"
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
import countries from './countries.json';
import regions from './aws-regions.json';
import { BUBBLE_OPTIONS } from './BubbleChart.map';
import { PRIMARY_COLORSET } from '@/components/molecules/charts/Chart.map';


const setDrawTools = (props, context, chartOptions) => {
    const mapData = countries;
    const xy = d3.geoEquirectangular().fitSize([props.minWidth, props.minHeight], mapData);

    const state = reactive({
        mapFeatures: mapData.features,
        mapPath: d3.geoPath().projection(xy),
        circleLoc: xy,
        regions,
        rScale: d3.scaleLinear().range([0, chartOptions.value.maxRadius]),
        chartData: [],
        colors: d3.scaleOrdinal().range(PRIMARY_COLORSET),
    });

    const maxRadius = computed(() => chartOptions.value.bubble.maxRadius);
    const max = computed(() => _.maxBy(props.data, d => d.value).value);
    const min = computed(() => _.minBy(props.data, d => d.value).value);

    const initRScale = () => {
        state.rScale = d3.scaleLinear()
            .range([0, maxRadius.value])
            .domain([min.value, max.value]);
    };

    const draw = (svgTools) => {
        initRScale();
        state.chartData = props.data;
        //
        // {
        //  "coordinates": {
        //    "latitude": 38.13,
        //    "longitude": -78.45
        //  }
        // }
    };

    const onMouseEnter = (e) => {
        e.target.style.fillOpacity = 1;
    };
    const onMouseLeave = (e) => {
        e.target.style.fillOpacity = 0.3;
    };


    return {
        ...toRefs(state),
        draw,
        onMouseEnter,
        onMouseLeave,
    };
};

export default {
    name: 'BubbleChart',
    components: { PChart, PChartLegend },
    directives: { tooltip: VTooltip },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        data: {
            type: Array,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        minHeight: {
            type: Number,
            default: 200,
        },
        minWidth: {
            type: Number,
            default: 500,
        },
        maxHeight: {
            type: Number,
            default: 200,
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
        const drawTools = setDrawTools(props, context, chartOptions);
        return {
            chartOptions,
            ...tooltips,
            ...drawTools,
        };
    },
};
</script>

<style lang="scss" scoped>
    .bubble-chart-container {
        display: flex;
        &.left {
            width: 100%;
            flex-direction: row-reverse;
            align-items: flex-end;
            overflow: hidden;
            .legend-container {
                width: 22%;
                overflow-y: scroll;
                .legend::v-deep {
                    .p-status {
                        width: calc(100% - 1.625rem);
                        justify-content: start;
                    }
                }
            }
            .p-chart {
                width: 78%;
            }
        }
        .p-chart {
            .map-path {
                fill: $primary3;
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
