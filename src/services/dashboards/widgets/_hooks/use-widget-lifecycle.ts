import {
    onUnmounted,
} from 'vue';

interface UseWidgetLifecycleOptions {
    disposeWidget?: () => void;
}

export const useWidgetLifecycle = ({
    disposeWidget,
}: UseWidgetLifecycleOptions): void => {
    onUnmounted(() => {
        if (disposeWidget) disposeWidget();
    });
};
