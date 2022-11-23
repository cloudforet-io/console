import {
    onMounted, onUnmounted,
} from 'vue';

interface UseWidgetLifecycleOptions {
    initWidget: () => void;
    disposeWidget?: () => void;
}

export const useWidgetLifecycle = ({
    initWidget, disposeWidget,
}: UseWidgetLifecycleOptions): void => {
    let isInitiated = false;
    // auto initiating
    onMounted(() => {
        if (!isInitiated) {
            initWidget();
            isInitiated = true;
        }
    });

    onUnmounted(() => {
        if (disposeWidget) disposeWidget();
    });
};
