<template>
    <div ref="containerRef"
         class="dashboard-widget-frame-container"
    >
        <p v-for="(item, index) in widgetFrameWidthList"
           :key="index"
        >
            {{ item }} {{ containerWidth - (containerWidth % 80) }}
        </p>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent, reactive, toRefs, ref, onMounted, watch, onUnmounted,
} from 'vue';

import { CONTAINER_MIN_WIDTH } from '@/services/dashboards/dashboard-detail/lib/config';
import { widgetFrameWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/helper';



export default defineComponent({
    name: 'DashboardWidgetFrameContainer',
    props: {
        cardTypeList: {
            type: Array as PropType<Array<string>>,
            default: () => ([]),
        },
    },
    setup() {
        const state = reactive({
            containerWidth: CONTAINER_MIN_WIDTH,
            widgetFrameWidthList: [] as Array<Array<number>>,
            // cardTypeList: computed(() => props.cardTypeList),
        });
        const containerRef = ref<HTMLDivElement|null>(null);


        let timer: undefined|number;
        const handleWindowResize = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                // RESIZE containerWidth on `resize`
                state.containerWidth = containerRef.value?.clientWidth ?? CONTAINER_MIN_WIDTH;
            }, 100);
        };

        onMounted(() => {
            // INIT containerWidth
            state.containerWidth = containerRef.value?.clientWidth ?? CONTAINER_MIN_WIDTH;
            window.addEventListener('resize', handleWindowResize);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', handleWindowResize);
        });

        watch(() => state.containerWidth, (containerWidth: number) => {
            const widgetFrameSizeMock = ['MD', 'MD', 'SM', 'FULL', 'MD', 'LG', 'SM'];
            state.widgetFrameWidthList = widgetFrameWidthAssigner(widgetFrameSizeMock, containerWidth - (containerWidth % 80));
        });

        return { containerRef, ...toRefs(state) };
    },
});
</script>

<style scoped>
.dashboard-widget-frame-container {
    min-width: 320px;
    max-width: 1840px;
}
</style>
