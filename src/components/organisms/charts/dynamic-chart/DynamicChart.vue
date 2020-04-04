<template>
    <div class="p-chart-container">
        <transition name="fade-in">
            <p-lottie v-if="loading" name="spinner" class="spinner"
                      auto
                      :size="1.5"
            />
        </transition>
        <transition name="fade-in">
            <canvas v-if="!loading" ref="chartRef" />
        </transition>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, reactive, Ref, toRefs, watch,
} from '@vue/composition-api';
import {
    dynamicChartProps, DynamicChartPropsType,
} from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import themes from '@/components/organisms/charts/dynamic-chart/themes';
import Chart, { ChartDataSets, ChartOptions, ChartPluginsOptions } from 'chart.js';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

export default defineComponent({
    name: 'PDynamicChart',
    props: dynamicChartProps,
    components: { PLottie },
    setup(props: DynamicChartPropsType) {
        interface DynamicChartStateType {
            chartRef: HTMLCanvasElement | null;
            chart: Chart | null;
            options: Ref<ChartOptions> | Ref<Readonly<ChartOptions>>;
            plugins: Ref<ChartPluginsOptions> | Ref<Readonly<ChartPluginsOptions>>;
            datasets: Ref<ChartDataSets[]> | Ref<Readonly<ChartDataSets[]>>;
        }

        const state: UnwrapRef<DynamicChartStateType> = reactive({
            chartRef: null,
            chart: null,
            options: computed(() => themes[props.type][props.styleType].options(props.themeProps)),
            plugins: computed(() => themes[props.type][props.styleType].plugins(props.themeProps)),
            datasets: computed(() => {
                if (state.chartRef) {
                    return props.dataset.map((d, i) => ({
                        label: d.label,
                        data: d.data,
                        borderColor: props.themeProps.colors[i],
                        backgroundColor: props.themeProps.colors[i],
                        // @ts-ignore
                        ...themes[props.type][props.styleType].settings(props.themeProps, state.chartRef, i),
                    }));
                }
                return [{}];
            }),
        });

        const initChart = () => {
            // @ts-ignore
            state.chart = new Chart(state.chartRef, {
                type: props.type,
                data: {
                    labels: props.labels || new Array(props.dataset[0].data.length).fill(''),
                    datasets: state.datasets,
                },
                options: state.options,
                plugins: state.plugins,
            });
        };

        // TODO: separate update logic and initiate logic
        watch(() => state.chartRef, (chartRef) => {
            if (chartRef) initChart();
        });

        return {
            ...toRefs(state),
            initChart,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .p-chart-container {
        position: relative;
        display: inline-block;
    }
    .spinner {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        &.fade-in-enter-active {
            transition: opacity 0.15s;
        }
        &.fade-in-enter {
            opacity: 0;
        }
        &.fade-in-enter-to {
            opacity: 1;
        }
    }
    .fade-in-leave-active {
        transition: opacity 0.15s;
    }
    .fade-in-leave-to {
        opacity: 0;
    }
    .fade-in-enter-to {
        opacity: 1;
    }
    canvas {
        height: 100%;
        width: 100%;
    }
</style>
