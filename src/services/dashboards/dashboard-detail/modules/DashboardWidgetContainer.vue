<template>
    <div ref="containerRef"
         class="dashboard-widget-frame-container"
    >
        <div
            v-for="(row, rowIndex) in widgetFrameWidthList"
            :key="`widget-frame-row-${rowIndex}`"
            class="dashboard-widget-frame-row"
        >
            <widget-frame
                v-for="(width, colIndex) in row"
                :key="`widget-frame-row-${rowIndex}-${colIndex}`"
                :width="width"
                :is-full="containerWidth === width"
                :widget-index="widgetFrameIndexList[rowIndex][colIndex]"
                @click-expand-icon="handleExpand"
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
    WIDGET_FRAME_CONTAINER_MIN_WIDTH, WIDGET_FRAME_WIDTH_FULL,
} from '@/services/dashboards/dashboard-detail/lib/config';
import { widgetFrameWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/helper';
import type { WidgetFrameSize } from '@/services/dashboards/dashboard-detail/lib/type';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';


export default defineComponent({
    name: 'DashboardWidgetFrameContainer',
    components: {
        WidgetFrame,
    },
    props: {
        widgetFrameSizeList: {
            type: Array as PropType<Array<WidgetFrameSize>>,
            default: () => ([]),
        },
    },
    setup(props) {
        const state = reactive({
            containerWidth: WIDGET_FRAME_CONTAINER_MIN_WIDTH,
            widgetFrameSizeList: props.widgetFrameSizeList,
            widgetFrameWidthList: [] as Array<Array<number>>,
            widgetFrameIndexList: [] as Array<Array<number>>,
        });
        const containerRef = ref<Element|null>(null);


        const refineContainerWidth = (containerWidth: number|undefined): number => {
            if (!containerWidth || containerWidth < WIDGET_FRAME_CONTAINER_MIN_WIDTH) return WIDGET_FRAME_CONTAINER_MIN_WIDTH;
            if (containerWidth > WIDGET_FRAME_CONTAINER_MAX_WIDTH) return WIDGET_FRAME_CONTAINER_MAX_WIDTH;
            return containerWidth - (containerWidth % 80);
        };

        /**
         * If widgetSizeList is given: ['MD', 'MD', **'SM'**, 'LG', 'SM'],
         * And user wants to expand 'SM' to 'FULL'
         * -> Each widgetFrame has its own widgetIndex (in this case, widgetIndex is 2)
         * If expand button has clicked, individual widgetFrame emits its own widgetIndex.
         * and widgetFrameContainer gains widgetIndex which wants to be changed.
         *
         * So on, widgetSizeList is changed by ['MD', 'MD', **'FULL'**, 'LG', 'SM']
         * And realign widths to every widget.
         * */
        const handleExpand = (type: 'expand'|'collapse', widgetIndex: number): void => {
            const _widgetFrameSizeList = [...state.widgetFrameSizeList];
            if (type === 'expand') _widgetFrameSizeList[widgetIndex] = WIDGET_FRAME_WIDTH_FULL;
            if (type === 'collapse') _widgetFrameSizeList[widgetIndex] = props.widgetFrameSizeList[widgetIndex];
            state.widgetFrameSizeList = [..._widgetFrameSizeList];
        };

        let timer: undefined|number;
        const handleResizeObserve = () => {
            // timeouts for throttle
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                // RESIZE containerWidth on `resizeObserve`
                state.containerWidth = refineContainerWidth(containerRef.value?.clientWidth);
                // for less throttle, change below timeout ms
            }, 500);
        };

        const observeInstance = new ResizeObserver(handleResizeObserve);

        onMounted(() => {
            // INIT containerWidth
            state.containerWidth = refineContainerWidth(containerRef.value?.clientWidth);
            observeInstance.observe(containerRef?.value as Element);
        });

        onUnmounted(() => {
            observeInstance.unobserve(containerRef?.value as Element);
        });

        watch([() => state.containerWidth, () => state.widgetFrameSizeList], ([containerWidth, widgetFrameSizeList]) => {
            state.widgetFrameWidthList = widgetFrameWidthAssigner(widgetFrameSizeList, refineContainerWidth(containerWidth));

            let widgetIndex = -1;
            state.widgetFrameIndexList = state.widgetFrameWidthList.map((d) => d.map(() => { widgetIndex += 1; return widgetIndex; }));
        });

        return {
            containerRef,
            ...toRefs(state),
            handleExpand,
        };
    },
});
</script>

<style scoped>
.dashboard-widget-frame-container {
    min-width: 320px;
    max-width: 1840px;
    display: grid;
    gap: 16px;
    .dashboard-widget-frame-row {
        display: flex;
        gap: 16px;
    }
}
</style>
