<template>
    <div class="hs-chart-container">
        <p-chart v-bind="$props" :options="chartOptions" @ready="draw">
            <g :class="gClass" :transform="gTransform">
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
                            @click="legendClick"
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
import { DONUT_OPTIONS } from './DonutChart.map';

const setDrawTools = (props, context, chartOptions) => {
    const colors = d3.scaleOrdinal().range(PRIMARY_COLORSET);
    const outerRadius = Math.min(props.minHeight, props.minWidth) / 2;
    const innerRadius = outerRadius - chartOptions.value.donut.thickness;

    const arc = d3.arc()
        .innerRadius(outerRadius)
        .outerRadius(innerRadius > 0 ? innerRadius : 0);

    const getPieData = () => d3.pie().value(d => d.value).sort(null)(props.data);

    const state = reactive({
        gClass: 'donut-g',
        gTransform: `translate(${props.minWidth / 2}, ${props.minHeight / 2})`,
        arc,
        colors,
        pathGroup: null,
        pieData: [],
        tooltipOptions: [],
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

    const legendClick = (key, val, e) => {
        context.emit('legendClick', key, val, e);
    };


    return {
        ...toRefs(state),
        draw,
        onMouseEnter,
        resetHoverList,
        legendClick,
    };
};

export default {
    name: 'PDonutChart',
    events: ['click'],
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
            validator(data) {
                return data.every(d => d.key && typeof d.value === 'number');
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
        minHeight: {
            type: Number,
            default: 400,
        },
    },
    setup(props, context) {
        const chartOptions = computed(() => _.merge({}, DONUT_OPTIONS, props.options));
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
    .legend-container {
        padding-top: 1.5rem;
        .legend::v-deep {
            display: flex;
        }
    }
</style>
