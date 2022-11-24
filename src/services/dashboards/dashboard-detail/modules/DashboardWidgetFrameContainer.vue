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

import {
    WIDGET_FRAME_CONTAINER_MAX_WIDTH,
    WIDGET_FRAME_CONTAINER_MIN_WIDTH,
} from '@/services/dashboards/dashboard-detail/lib/config';
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
            containerWidth: WIDGET_FRAME_CONTAINER_MIN_WIDTH,
            widgetFrameWidthList: [] as Array<Array<number>>,
            // cardTypeList: computed(() => props.cardTypeList),
        });
        const containerRef = ref<HTMLDivElement|null>(null);


        const refineContainerWidth = (containerWidth: number): number => {
            if (containerWidth < WIDGET_FRAME_CONTAINER_MIN_WIDTH) return WIDGET_FRAME_CONTAINER_MIN_WIDTH;
            if (containerWidth > WIDGET_FRAME_CONTAINER_MAX_WIDTH) return WIDGET_FRAME_CONTAINER_MAX_WIDTH;
            return containerWidth - (containerWidth % 80);
        };

        let timer: undefined|number;
        const handleWindowResize = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                // RESIZE containerWidth on `resize`
                state.containerWidth = containerRef.value?.clientWidth ?? WIDGET_FRAME_CONTAINER_MIN_WIDTH;
            }, 100);
        };

        onMounted(() => {
            // INIT containerWidth
            state.containerWidth = containerRef.value?.clientWidth ?? WIDGET_FRAME_CONTAINER_MIN_WIDTH;
            window.addEventListener('resize', handleWindowResize);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', handleWindowResize);
        });

        watch(() => state.containerWidth, (containerWidth: number) => {
            const WIDGET_FRAME_SIZE_MOCK = ['MD', 'MD', 'SM', 'MD', 'LG', 'SM'];

            state.widgetFrameWidthList = widgetFrameWidthAssigner(WIDGET_FRAME_SIZE_MOCK, refineContainerWidth(containerWidth));
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
