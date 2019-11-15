<template>
    <div class="hs-chart-container">
        <p-chart ref="chart" v-bind="$props">
            <template>
                <g :class="gClass" :transform="gTransform">
                    <g v-for="(pd, idx) in pieData" ref="pathGroup" :key="idx"
                       :fill="colors(idx)"
                    >
                        <path v-tooltip="getTooltipOptions(pd.data, idx)"
                              :d="arc(pd)"
                              @mouseenter="onMouseenter(pd.data, idx)"
                              @mouseleave="onMouseleave"
                        />
                        <circle :cx="Math.round(arc.centroid(pd)[0])"
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
    reactive, toRefs, computed, ref, onMounted,
} from '@vue/composition-api';
import { VTooltip } from 'v-tooltip';
import PChart, { setup } from '@/components/molecules/charts/Chart';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from '@/components/molecules/charts/Chart.map';
import { DONUT_OPTIONS } from './DonutChartD3.map';

const setDrawTools = (props, chartOptions) => {
    const colors = d3.scaleOrdinal().range(PRIMARY_COLORSET);
    const outerRadius = Math.min(props.minHeight, props.minWidth) / 2;
    const innerRadius = outerRadius - chartOptions.value.donut.thickness;

    const arc = d3.arc()
        .innerRadius(outerRadius)
        .outerRadius(innerRadius > 0 ? innerRadius : 0);

    const state = reactive({
        gClass: 'donut-g',
        gTransform: `translate(${props.minWidth / 2}, ${props.minHeight / 2})`,
        pieData: computed(() => d3.pie().value(d => d.value).sort(null)(props.data)),
        arc,
        colors,
        pathGroup: null,
    });

    const onMouseenter = (data, idx) => {
        state.pathGroup.forEach((path, i) => {
            path.style.opacity = i === idx ? 1.0 : 0.3;
        });
    };

    const onMouseleave = () => {
        state.pathGroup.forEach((path) => {
            path.style.opacity = 1.0;
        });
    };

    return {
        ...toRefs(state),
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
        minHeight: {
            type: Number,
            default: 200,
        },
        minWidth: {
            type: Number,
            default: 200,
        },
        maxHeight: {
            type: Number,
            default: null,
        },
    },
    setup(props, context) {
        const chart = ref(null);
        const chartRefs = reactive({
            svgContainerRef: computed(() => (chart.value ? chart.value.$refs.svgContainerRef : null)),
        });
        const chartOptions = computed(() => _.merge({}, DEFAULT_OPTIONS, DONUT_OPTIONS, props.options));
        const state = setup(props, context, chartRefs, chartOptions);
        const drawTools = setDrawTools(props, chartOptions);
        return {
            ...state,
            ...drawTools,
        };
    },
};
</script>