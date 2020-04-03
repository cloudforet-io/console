<template>
    <div class="p-donut-chart">
        <p-chart ref="chartRef" v-bind="$props"
                 @ready="draw" @resize="resizeElements"
        >
            <g :transform="gTransform">
                <g v-for="(pd, idx) in pieData" ref="pathGroup" :key="idx"
                   :style="{
                       fill: empty? emptyColor : colors(idx),
                       opacity: !hoverState || hoverList[idx] ? 1.0 : 0.3
                   }"
                   @mouseenter="onMouseEnter(idx)"
                   @mouseleave="resetHoverList"
                >
                    <path class="donut-path"
                          :d="arc(pd)"
                          @click="$emit('legendClick', pd.data.key, pd.data.value)"
                    />
                    <text v-if="empty" class="empty-text"
                          text-anchor="middle" dominant-baseline="middle"
                          :y="0"
                    >
                        No Data
                    </text>
                    <circle v-else
                            v-tooltip="{
                                ...getTooltipOptions(pd.data, idx),
                                trigger: 'manual',
                                show: pd.data.value && hoverList[idx],
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
                            :text="d.label || d.key" :count="d.value" :icon-color="colors(idx)"
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
import PChart, { setTooltips } from '@/components/molecules/charts/ChartD3.vue';
import PChartLegend from '@/components/organisms/legends/ChartLegend.vue';
import { colorset } from '@/lib/util';
import colorStyles from '@/styles/colors';


const setDrawTools = (props, context) => {
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

    const colors = d3.scaleOrdinal().range(colorset);

    const outerRadius = computed(() => Math.min(sizeTools.clientWidth, props.height || sizeTools.clientHeight) / 2);
    const innerRadius = computed(() => outerRadius.value - props.thickness);
    const arc = computed(() => d3.arc()
        .innerRadius(outerRadius.value)
        .outerRadius(innerRadius.value > 0 ? innerRadius.value : 0));

    const state = reactive({
        arc,
        colors,
        pathGroup: null,
        pieData: [],
        hoverList: [],
        hoverState: false,
        chartEl: undefined,
        empty: computed(() => !d3.sum(props.data, d => d.value)),
        emptyColor: colorStyles.primary3,
    });


    const getPieData = () => {
        if (state.empty) return d3.pie().value(d => d.value).sort(null)([{ key: 'empty', value: 1 }]);
        return d3.pie().value(d => d.value).sort(null)(props.data);
    };

    const resetHoverList = () => {
        if (state.empty) return;
        state.hoverState = false;
        state.hoverList = new Array(props.data.length).fill(false);
    };
    const draw = () => {
        resetHoverList();
        state.pieData = getPieData();
    };

    const onMouseEnter = (idx) => {
        if (state.empty) return;
        state.hoverState = true;
        state.hoverList.splice(idx, 1, true);
    };

    const resizeElements = (svgTools) => {
        sizeTools.gTransform = `
            translate(${svgTools.chartWidth.value / 2},
            ${(svgTools.chartHeight.value) / 2})
        `;
    };

    return {
        ...toRefs(sizeTools),
        ...toRefs(state),
        draw,
        onMouseEnter,
        resetHoverList,
        resizeElements,
    };
};

export default {
    name: 'PPieChart',
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
        preserve: {
            type: [Object, Boolean],
            default: () => ({
                align: 'xMinYMin',
                meetOrSlice: 'meet',
            }),
        },
        responsive: {
            type: Boolean,
            default: false,
        },
        height: {
            type: Number,
            default: 400,
        },
        thickness: {
            type: Number,
            default: 40,
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

<style lang="postcss" scoped>
    .p-donut-chart {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .p-chart-container::v-deep {
            height: auto;
        }
        .donut-path {
            cursor: pointer;
        }
        .legend-container {
            padding-top: 1.5rem;
            .legend::v-deep {
                display: flex;
                width: 50%;
                max-width: 150px;
                justify-content: space-between;
            }
        }
        .empty-text {
            fill: theme('colors.primary2');
        }
    }
</style>
