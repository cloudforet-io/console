<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <div
            v-for="(row, rowIndex) in widgetWidthList"
            :key="`widget-row-${rowIndex}`"
            class="dashboard-widget-row"
        >
            <widget-frame
                v-for="(width, colIndex) in row"
                :key="`widget-row-${rowIndex}-${colIndex}`"
                :width="width"
                :is-full="containerWidth === width"
                :widget-index="widgetIndexList[rowIndex][colIndex]"
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
    WIDGET_CONTAINER_MAX_WIDTH,
    WIDGET_CONTAINER_MIN_WIDTH,
} from '@/services/dashboards/dashboard-detail/lib/config';
import { widgetThemeAssigner } from '@/services/dashboards/dashboard-detail/lib/theme-helper';
import type { WidgetThemeAssignedList, WidgetThemeOption } from '@/services/dashboards/dashboard-detail/lib/type';
import { widgetWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/width-helper';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetSize } from '@/services/dashboards/widgets/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/config';


export default defineComponent({
    name: 'DashboardWidgetContainer',
    components: {
        WidgetFrame,
    },
    props: {
        widgetSizeList: {
            type: Array as PropType<Array<WidgetSize>>,
            default: () => ([]),
        },
        widgetThemeOptionList: {
            type: Array as PropType<Array<WidgetThemeOption>>,
            default: () => ([]),
        },
    },
    setup(props) {
        const state = reactive({
            // width
            containerWidth: WIDGET_CONTAINER_MIN_WIDTH,
            widgetSizeList: props.widgetSizeList,
            widgetWidthList: [] as Array<Array<number>>,
            widgetIndexList: [] as Array<Array<number>>,
            // theme
            widgetThemeList: [] as WidgetThemeAssignedList,
        });
        const containerRef = ref<Element|null>(null);


        const refineContainerWidth = (containerWidth: number|undefined): number => {
            if (!containerWidth || containerWidth < WIDGET_CONTAINER_MIN_WIDTH) return WIDGET_CONTAINER_MIN_WIDTH;
            if (containerWidth > WIDGET_CONTAINER_MAX_WIDTH) return WIDGET_CONTAINER_MAX_WIDTH;
            return containerWidth - (containerWidth % 80);
        };

        /**
         * If widgetSizeList is given: ['MD', 'MD', **'SM'**, 'LG', 'SM'],
         * And user wants to expand 'SM' to 'FULL'
         * -> Each widget has its own widgetIndex (in this case, widgetIndex is 2)
         * If expand button has clicked, individual widget emits its own widgetIndex.
         * and widgetContainer gains widgetIndex which wants to be changed.
         *
         * So on, widgetSizeList is changed by ['MD', 'MD', **'FULL'**, 'LG', 'SM']
         * And realign widths to every widget.
         * */
        const handleExpand = (type: 'expand'|'collapse', widgetIndex: number): void => {
            const _widgetSizeList = [...state.widgetSizeList];
            if (type === 'expand') _widgetSizeList[widgetIndex] = WIDGET_SIZE.full;
            if (type === 'collapse') _widgetSizeList[widgetIndex] = props.widgetSizeList[widgetIndex];
            state.widgetSizeList = [..._widgetSizeList];
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

        // for width realignment
        watch([() => state.containerWidth, () => state.widgetSizeList], ([containerWidth, widgetSizeList]) => {
            state.widgetWidthList = widgetWidthAssigner(widgetSizeList, refineContainerWidth(containerWidth));

            let widgetIndex = -1;
            state.widgetIndexList = state.widgetWidthList.map((d) => d.map(() => { widgetIndex += 1; return widgetIndex; }));
        });

        // for theme align
        watch(() => state.widgetSizeList, () => {
            state.widgetThemeList = widgetThemeAssigner(props.widgetThemeOptionList);
        }, { immediate: true });

        return {
            containerRef,
            ...toRefs(state),
            handleExpand,
        };
    },
});
</script>

<style scoped>
.dashboard-widget-container {
    min-width: 320px;
    max-width: 1840px;
    display: grid;
    gap: 16px;
    .dashboard-widget-row {
        display: flex;
        gap: 16px;
    }
}
</style>
