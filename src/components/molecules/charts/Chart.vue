<template>
    <div ref="chartRef"
         class="p-chart-container"
         :style="{
             minHeight: `${minHeight}px`,
             minWidth: `${minWidth}px`,
             maxHeight: maxHeight ? `${maxHeight}px` : null,
         }"
    >
        <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" :width="svgWidth"
             :preserveAspectRatio="svgRatio"
        >
            <slot name="default" />
        </svg>

        <Spinner :value="!startDraw"
                 :backdrop="true"
                 class="p-loading-spinner"
                 :style="{
                     minHeight: `${minHeight}px`,
                     minWidth: `${minWidth}px`,
                 }"
        />
    </div>
</template>

<script>
import _ from 'lodash';
import {
    reactive, toRefs, watch, onMounted, computed, onUnmounted,
} from '@vue/composition-api';
import Spinner from '@/components/base/spinner/BaseSpinner';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from './Chart.map';


export const setTooltips = () => {
    const generateTooltipTitle = (data, idx, color) => {
        const title = document.createElement('div');
        title.classList.add('tooltip-title');

        const circle = document.createElement('span');
        circle.classList.add('circle');
        circle.style.backgroundColor = color;

        const text = document.createElement('span');
        text.classList.add('text');
        text.innerText = `${data.key}: ${data.value}`;

        title.appendChild(circle);
        title.appendChild(text);

        return title;
    };

    const getTooltipOptions = (data, idx, options) => {
        const obj = _.merge({
            placement: 'top',
            trigger: 'hover',
            template: `<div class="tooltip p-tooltip" role="tooltip">
                        <div class="tooltip-arrow"></div>
                        <div class="tooltip-inner"></div>
                    </div>`,
            html: true,
            content: generateTooltipTitle(data, idx, PRIMARY_COLORSET[idx]),
        }, options);
        return obj;
    };

    return {
        getTooltipOptions,
        generateTooltipTitle,
    };
};

export const setSvg = (props, context, options) => {
    const state = reactive({
        svgRatio: '',
        svgWidth: '100%',
        chartHeight: props.minHeight,
        chartWidth: props.minWidth,
    });

    const responsiveWidthOnly = computed(() => options.value.responsive.width && !options.value.responsive.height);

    const setChartWidth = (width) => {
        state.chartWidth = width;
    };
    const setChartHeight = (height) => {
        state.chartHeight = height;
    };

    const resizeSvg = () => {
        context.emit('resize');
        // if (resizeElementsFn) resizeElementsFn(); // IMPEMENT IN CHILD COMPONENT
    };

    const setPreserveAspectRatio = (preserve) => {
        if (preserve) {
            state.svgRatio = `${preserve.align} ${preserve.meetOrSlice}`;
        } else {
            state.svgRatio = null;
        }
    };

    const setSvgResponsiveWidthOnly = () => {
        if (!context.refs.chartRef) return;
        const width = context.refs.chartRef.getBoundingClientRect().width;
        setChartWidth(width);
        state.svgWidth = `${state.chartWidth}px`;
        window.addEventListener('resize', resizeSvg);
    };

    const setSvgSize = () => {
        const responsive = options.value.responsive;

        if (responsiveWidthOnly.value) setSvgResponsiveWidthOnly();

        setPreserveAspectRatio(responsive.preserveAspectRatio);
    };

    onUnmounted(() => {
        if (responsiveWidthOnly.value) window.removeEventListener('resize', resizeSvg);
    });

    return {
        ...toRefs(state),
        setSvgSize,
        setChartWidth,
        setChartHeight,
    };
};

export const setDrawTrigger = (props, context, svgTools) => {
    const state = reactive({
        isMounted: false,
        startDraw: !props.loading,
    });

    const emitReadyEvent = () => {
        svgTools.setSvgSize();
        state.startDraw = true;
        context.emit('ready', svgTools);
    };

    watch(() => props.loading, (val) => {
        if (!val && state.isMounted) emitReadyEvent();
        else state.startDraw = false;
    });

    watch(() => state.isMounted, (val) => {
        if (val && !props.loading) emitReadyEvent();
        else state.startDraw = false;
    });


    onMounted(() => {
        state.isMounted = true;
    });

    return {
        ...toRefs(state),
    };
};

export const setup = (props, context) => {
    const chartOptions = computed(() => _.merge({}, DEFAULT_OPTIONS, props.options));
    const svgState = setSvg(props, context, chartOptions);
    const svgTools = {
        ...svgState,
    };
    const trigger = setDrawTrigger(props, context, svgTools);

    return {
        ...svgTools,
        ...trigger,
    };
};

export default {
    name: 'PChartD3',
    events: ['resize', 'ready'],
    components: {
        Spinner,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        minHeight: {
            type: Number,
            default: 100,
        },
        minWidth: {
            type: Number,
            default: 250,
        },
        maxHeight: {
            type: Number,
            default: null,
        },
        maxWidth: {
            type: Number,
            default: null,
        },
    },
    setup(props, context) {
        const state = setup(props, context);

        return {
            ...state,
        };
    },

};
</script>

<style lang="scss">
    .p-chart-container {
        position: relative;
        width: 100%;
        height: 100%;
        .p-loading-spinner {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 99;
            width: 100%;
            height: 100%;
        }
    }

    .tooltip-title {
        display: flex;
        align-items: center;
        .circle {
            display: inline-block;
            height: 12px;
            width: 12px;
            border-radius: 50%;
        }
        .text {
            padding-left: 4px;
            font-size: 14px;
            color: $white;
        }
    }
</style>
