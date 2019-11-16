<template>
    <div class="hs-chart-container">
        <p-chart v-bind="$props" :options="chartOptions" @ready="draw"
        >
            <template>
                <g :class="gClass" :transform="gTransform">
                    <g v-for="(pd, idx) in pieData" ref="pathGroup" :key="idx"
                       :fill="colors(idx)"
                    >
                        <path :d="arc(pd)"
                              @mouseenter="onMouseenter(pd.data, idx)"
                              @mouseleave="onMouseleave(idx)"
                        />
                        <circle v-tooltip="{
                                    ...getTooltipOptions(pd.data, idx),
                                    trigger: 'manual',
                                    show: visibleTooltips[idx],
                                }"
                                :cx="Math.round(arc.centroid(pd)[0])"
                                :cy="Math.round(arc.centroid(pd)[1])"
                        />
                    </g>
                </g>
            </template>
        </p-chart>
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
        visibleTooltips: [],
        chartEl: undefined,
    });

    const draw = () => {
        state.visibleTooltips = new Array(props.data.length).fill(false);
        state.pieData = getPieData();
    };

    const onMouseenter = (data, idx) => {
        state.visibleTooltips.splice(idx, 1, true);
        state.pathGroup.forEach((path, i) => {
            path.style.opacity = i === idx ? 1.0 : 0.3;
        });
    };

    const onMouseleave = (idx) => {
        state.visibleTooltips.splice(idx, 1, false);
        state.pathGroup.forEach((path) => {
            path.style.opacity = 1.0;
        });
    };

    return {
        ...toRefs(state),
        draw,
        onMouseenter,
        onMouseleave,
    };
};

export default {
    name: 'DonutChart',
    components: { PChart },
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
