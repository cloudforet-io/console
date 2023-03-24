import type { Ref } from 'vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import {
    WIDGET_CONTAINER_MAX_WIDTH,
    WIDGET_CONTAINER_MIN_WIDTH, WIDGET_WIDTH_CRITERIA,
} from '@/services/dashboards/dashboard-detail/modules/dashboard-widget-container/widget-container-config';

interface UseContainerResizerOptions {
    observeResize: boolean;
    containerRef: Ref<HTMLElement|null>;
}
export const useContainerWidth = ({ observeResize, containerRef }: UseContainerResizerOptions) => {
    const containerWidth = ref(WIDGET_CONTAINER_MIN_WIDTH);

    const refineContainerWidth = (_containerWidth: number|undefined): number => {
        if (!_containerWidth || _containerWidth < WIDGET_CONTAINER_MIN_WIDTH) return WIDGET_CONTAINER_MIN_WIDTH;
        if (_containerWidth > WIDGET_CONTAINER_MAX_WIDTH) return WIDGET_CONTAINER_MAX_WIDTH;
        return _containerWidth - (_containerWidth % WIDGET_WIDTH_CRITERIA);
    };

    let timer: undefined|number;
    const handleResizeObserve = () => {
        // timeouts for throttle
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            // RESIZE containerWidth on `resizeObserve`
            containerWidth.value = refineContainerWidth(containerRef.value?.clientWidth);
            // for less throttle, change below timeout ms
        }, 500);
    };

    let observeInstance;
    if (observeResize) observeInstance = new ResizeObserver(handleResizeObserve);

    onMounted(() => {
        // init containerWidth
        containerWidth.value = refineContainerWidth(containerRef.value?.clientWidth);

        if (observeResize && observeInstance) observeInstance.observe(containerRef?.value as Element);
    });
    onBeforeUnmount(() => {
        if (observeResize && observeInstance) observeInstance.unobserve(containerRef?.value as Element);
    });


    return {
        containerWidth,
    };
};
