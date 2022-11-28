<template>
    <div ref="containerRef"
         class="dashboard-widget-frame-container"
    >
        <div
            v-for="(row, rowIndex) in widgetFrameWidthList"
            :key="`widget-frame-row-${rowIndex}`"
        >
            <widget-frame
                v-for="(width, index) in row"
                :key="`widget-frame-row-${rowIndex}-${index}`"
                :width="width"
            />
        </div>
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
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';


export default defineComponent({
    name: 'DashboardWidgetFrameContainer',
    components: {
        WidgetFrame,
    },
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
        const containerRef = ref<Element|null>(null);


        const refineContainerWidth = (containerWidth: number): number => {
            if (containerWidth < WIDGET_FRAME_CONTAINER_MIN_WIDTH) return WIDGET_FRAME_CONTAINER_MIN_WIDTH;
            if (containerWidth > WIDGET_FRAME_CONTAINER_MAX_WIDTH) return WIDGET_FRAME_CONTAINER_MAX_WIDTH;
            return containerWidth - (containerWidth % 80);
        };

        let timer: undefined|number;
        const handleResizeObserve = () => {
            // timeouts for throttle
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                // RESIZE containerWidth on `resizeObserve`
                state.containerWidth = containerRef.value?.clientWidth ?? WIDGET_FRAME_CONTAINER_MIN_WIDTH;
                // for less throttle, change below timeout ms
            }, 500);
        };

        const observeInstance = new ResizeObserver(handleResizeObserve);

        onMounted(() => {
            // INIT containerWidth
            state.containerWidth = containerRef.value?.clientWidth ?? WIDGET_FRAME_CONTAINER_MIN_WIDTH;
            observeInstance.observe(containerRef?.value as Element);
        });

        onUnmounted(() => {
            observeInstance.unobserve(containerRef?.value as Element);
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
