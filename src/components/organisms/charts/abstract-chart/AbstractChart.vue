<template>
    <div class="p-chart-container">
        <transition name="fade-in">
            <p-lottie v-if="loading" name="spinner" class="spinner"
                      auto
                      :size="1.5"
            />
        </transition>
        <transition name="fade-in">
            <canvas v-if="!loading" ref="chartRef"/>
        </transition>
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
} from '@vue/composition-api';
import {
    abstractChartProps,
} from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

export default defineComponent({
    name: 'PAbstractChart',
    props: abstractChartProps,
    components: { PLottie },
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
