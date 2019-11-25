<template>
    <div class="p-donut-chart">
        <p-chart ref="chartRef"
                 v-bind="$props" :options="chartOptions"
                 @ready="draw"
        >
            <g :transform="gTransform">
                <g v-for="(pd, idx) in pieData" ref="pathGroup" :key="idx"
                   :style="{
                       fill: colors(idx),
                       opacity: !hoverState || hoverList[idx] ? 1.0 : 0.3
                   }"
                   @mouseenter="onMouseEnter(idx)"
                   @mouseleave="resetHoverList"
                >
                    <path :d="arc(pd)" />
                    <circle v-tooltip="{
                                ...getTooltipOptions(pd.data, idx),
                                trigger: 'manual',
                                show: hoverList[idx],
                                popperOptions: {
                                    onCreate(o) {
                                        o.instance.popper.addEventListener('mouseenter', () => {
                                            onMouseEnter(idx)
                                        })
                                        o.instance.popper.addEventListener('mouseleave', resetHoverList)
                                    },
                                },
                            }"
                            :cx="Math.round(arc.centroid(pd)[0])"
                            :cy="Math.round(arc.centroid(pd)[1])"
                    />
                </g>
            </g>
        </p-chart>
        <div class="legend-container">
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
import { PRIMARY_COLORSET } from '@/components/molecules/charts/Chart.map';
import { DONUT_OPTIONS } from './DonutChart.map';


const setSizeTools = (props, context, chartOptions) => {
    const state = reactive({
    });

    return {
        ...toRefs(state),
    };
};

const setDrawTools = (props, context, chartOptions) => {
    const sizeTools = reactive({
        clientWidth: 0,
        clientHeight: 0,
        gTransform: '',
    });

    onMounted(() => {
        const clientRect = context.refs.chartRef.$el.getBoundingClientRect();
        sizeTools.clientHeight = clientRect.height;
        sizeTools.clientWidth = clientRect.width;
        sizeTools.gTransform = `translate(${sizeTools.clientWidth / 2}, ${(props.height || sizeTools.clientHeight) / 2})`;
    });

    const colors = d3.scaleOrdinal().range(PRIMARY_COLORSET);

    const outerRadius = computed(() => Math.min(sizeTools.clientWidth, props.height || sizeTools.clientHeight) / 2);
    const innerRadius = computed(() => outerRadius.value - chartOptions.value.donut.thickness);
    const arc = computed(() => d3.arc()
        .innerRadius(outerRadius.value)
        .outerRadius(innerRadius.value > 0 ? innerRadius.value : 0));

    const getPieData = () => d3.pie().value(d => d.value).sort(null)(props.data);

    const state = reactive({
        arc,
        colors,
        pathGroup: null,
        pieData: [],
        hoverList: [],
        hoverState: false,
        chartEl: undefined,
    });

    const resetHoverList = () => {
        state.hoverState = false;
        state.hoverList = new Array(props.data.length).fill(false);
    };
    const draw = () => {
        resetHoverList();
        state.pieData = getPieData();
    };

    const onMouseEnter = (idx) => {
        state.hoverState = true;
        state.hoverList.splice(idx, 1, true);
    };

    return {
        ...toRefs(sizeTools),
        ...toRefs(state),
        draw,
        onMouseEnter,
        resetHoverList,
    };
};

export default {
    name: 'PDonutChart',
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
            validator(data) {
                return data.every(d => d.key && typeof d.value === 'number');
            },
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        height: {
            type: Number,
            default: 400,
        },
    },
    setup(props, context) {
        const chartOptions = computed(() => _.merge({}, DONUT_OPTIONS, props.options));
        const tooltips = setTooltips(props, context, chartOptions);
        const sizeTools = setSizeTools(props, context, chartOptions);
        const drawTools = setDrawTools(props, context, chartOptions);
        return {
            chartOptions,
            ...tooltips,
            ...sizeTools,
            ...drawTools,
        };
    },
};
</script>

<style lang="scss" scoped>
    .p-donut-chart {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .p-chart-container::v-deep {
            height: auto;
        }
        .legend-container {
            padding-top: 1.5rem;
            .legend::v-deep {
                display: flex;
            }
        }
    }
</style>
