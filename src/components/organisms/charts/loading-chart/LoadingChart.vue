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
    defineComponent, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import Chart from 'chart.js';
import {
    loadingChartProps, LoadingChartPropsType,
} from '@/components/organisms/charts/loading-chart/LoadingChart.toolset';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

export const chartSetup = (props: LoadingChartPropsType) => {
    const chartRef: any = ref(null);
    const vm: any = getCurrentInstance();

    const state: any = reactive({
        chart: null,
        options: {},
        plugins: [{}],
        datasets: computed(() => props.dataset.map((d, i) => ({
            label: d.label,
            data: d.data,
        }))),
    });

    const initChart = (): void => {
        state.chart = new Chart(chartRef.value, {
            type: props.type,
            data: {
                labels: props.labels,
                datasets: vm.datasets,
            },
            options: vm.options,
            plugins: vm.plugins,
        });
    };

    watch(() => chartRef.value, (val) => {
        if (val) vm.initChart();
    });

    return {
        chartRef,
        ...toRefs(state),
        initChart,
    };
};

export default defineComponent({
    name: 'PLoadingChart',
    props: loadingChartProps,
    components: { PLottie },
    setup: chartSetup,
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
</style>
