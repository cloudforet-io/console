<template>
    <div ref="chartRef"
         class="p-chart-container"
    >
        <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
             :preserveAspectRatio="svgRatio"
             :style="{
                 width: svgWidth ? `${svgWidth}px` : '100%',
                 height: svgHeight ? `${svgHeight}px` : '100%',
             }"
        >
            <slot name="default" />
        </svg>

        <transition name="fade-in">
            <div v-if="!startDraw" class="spinner-container">
                <p-lottie class="spinner"
                          :size="1.5" :auto="true" name="spinner"
                />
            </div>
        </transition>
    </div>
</template>

<script>
import _ from 'lodash';
import {
    reactive, toRefs, watch, onMounted, computed, onUnmounted,
} from '@vue/composition-api';
import PSpinner from '@/components/base/spinner/BaseSpinner';
import PLottie from '@/components/molecules/lottie/PLottie';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from './Chart.map';


export const setTooltips = () => {
    const generateTooltipTitle = (data, idx, color) => {
        const colorStyle = color || PRIMARY_COLORSET[idx];

        const title = document.createElement('div');
        title.classList.add('tooltip-title');

        const circle = document.createElement('span');
        circle.classList.add('circle');
        circle.style.backgroundColor = colorStyle;

        const text = document.createElement('span');
        text.classList.add('text');
        text.innerText = `${data.key}: ${data.value}`;

        title.appendChild(circle);
        title.appendChild(text);

        return title;
    };

    /**
     *
     * @param data : object. data to show on tooltip. required.
     *               {
     *                   key: string
     *                   value: number
     *               }
     * @param idx : number. data index for auto color mapping. required.
     * @param options : object. tooltip generation options. optional.
     *                  {
     *                      color: string
     *                  }
     * @returns {{template: string, html: boolean, autoHide: boolean, placement: string, trigger: string, content: *}}
     */
    const getTooltipOptions = (data, idx, options) => ({
        placement: 'top',
        trigger: 'hover',
        template: `<div class="tooltip p-tooltip" role="tooltip">
                        <div class="tooltip-arrow"></div>
                        <div class="tooltip-inner"></div>
                    </div>`,
        html: true,
        content: generateTooltipTitle(data, idx, options ? options.color : undefined),
        autoHide: false,
    });

    return {
        getTooltipOptions,
        generateTooltipTitle,
    };
};

export const setSvg = (props, context, options) => {
    const state = reactive({
        svgRatio: '',
        svgWidth: null,
        svgHeight: null,
        chartHeight: 0,
        chartWidth: 0,
    });

    const isWidthResponsive = computed(() => options.value.responsive.width);

    const setChartWidth = (width) => {
        state.chartWidth = width;
    };
    const setChartHeight = (height) => {
        state.chartHeight = height;
    };

    const setPreserveAspectRatio = (preserve) => {
        if (preserve) {
            state.svgRatio = `${preserve.align} ${preserve.meetOrSlice}`;
        } else {
            state.svgRatio = null;
        }
    };

    const emitResizeEvent = () => {
        setChartWidth(context.refs.chartRef.getBoundingClientRect().width);
        state.svgWidth = state.chartWidth;
        context.emit('resize', { ...toRefs(state) });
    };
    const setSvgResponsiveWidth = () => {
        state.svgWidth = state.chartWidth;
        window.addEventListener('resize', emitResizeEvent);
    };
    onUnmounted(() => {
        if (isWidthResponsive.value) window.removeEventListener('resize', emitResizeEvent);
    });

    const setSvgSize = () => {
        const responsive = options.value.responsive;

        setChartWidth(context.refs.chartRef.getBoundingClientRect().width);
        if (isWidthResponsive.value) setSvgResponsiveWidth();

        if (!options.value.responsive.height && props.height) {
            setChartHeight(props.height);
            state.svgHeight = state.chartHeight;
        }

        setPreserveAspectRatio(responsive.preserveAspectRatio);
    };

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
        startDraw: false, //! props.loading,
    });

    const emitReadyEvent = () => {
        svgTools.setSvgSize();
        state.startDraw = true;
        context.emit('ready', svgTools);
    };

    const isDataReady = (data) => {
        if (data instanceof Array) return data.length > 0;
        return Object.keys(data).length > 0;
    };

    if (props.loading === undefined) {
        watch([() => props.data, () => state.isMounted], ([data, isMounted]) => {
            if (isDataReady(data) && isMounted) emitReadyEvent();
            else state.startDraw = false;
        });
    } else {
        watch([() => props.loading, () => state.isMounted], ([loading, isMounted]) => {
            if (!loading && isMounted) emitReadyEvent();
            else state.startDraw = false;
        });
    }


    onMounted(() => {
        state.isMounted = true;
    });

    return {
        ...toRefs(state),
    };
};

const setup = (props, context) => {
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
    name: 'PChart',
    events: ['resize', 'ready'],
    components: {
        PLottie,
    },
    props: {
        loading: {
            type: Boolean,
            default: undefined,
        },
        data: {
            type: [Array, Object],
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
        display: flex;
        justify-content: center;
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

    .spinner-container {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 99;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: rgba($white, .5);
        .spinner {
            position: absolute;
            display: inline-flex;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        &.fade-in-enter-active {
            transition: opacity .3s, visibility .3s;
        }
        &.fade-in-leave-active {
            transition: opacity .3s, visibility .3s;
        }
        &.fade-in-enter, &.fade-in-leave-to {
            visibility: hidden;
            opacity: 0;
        }
        &.fade-in-leave, &.fade-in-enter-to {
            visibility: visible;
            opacity: 1;
        }
    }
</style>
