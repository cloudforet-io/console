import {
    onMounted,
} from 'vue';

interface UseWidgetLifecycleOptions {
    initWidget: () => void;
}

export const useWidgetLifecycle = ({
    initWidget,
}: UseWidgetLifecycleOptions): void => {
    let isInitiated = false;
    // auto initiating
    onMounted(() => {
        if (!isInitiated) {
            initWidget();
            isInitiated = true;
        }
    });
};
