import type { Ref } from 'vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

interface UseContainerResizerOptions {
    observeResize: boolean;
    containerRef: Ref<HTMLElement|null>;
}
export const useGnbContainerWidth = ({ observeResize, containerRef }: UseContainerResizerOptions) => {
    const containerWidth = ref<number>();

    const refineContainerWidth = (_containerWidth: number|undefined): number => _containerWidth || 0;

    let timer: undefined|number;
    const handleResizeObserve = () => {
        // timeouts for throttle
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            // RESIZE containerWidth on `resizeObserve`
            containerWidth.value = refineContainerWidth(containerRef.value?.clientWidth);
            // for less throttle, change below timeout ms
        }, 300);
    };

    let observeInstance;
    if (observeResize) observeInstance = new ResizeObserver(handleResizeObserve);

    onMounted(() => {
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
