import {
    onUnmounted, watch,
} from 'vue';

import type { WidgetProps } from '@/services/dashboards/widgets/_configs/config';

interface UseWidgetLifecycleOptions {
    disposeWidget?: () => void;
    refreshWidget: () => void;
    props: WidgetProps;
}
export const useWidgetLifecycle = ({
    disposeWidget,
    refreshWidget,
    props,
}: UseWidgetLifecycleOptions): void => {
    onUnmounted(() => {
        if (disposeWidget) disposeWidget();
    });
    watch(() => props.dashboardVariables, () => {
        if (props.initiated && !props.errorMode) refreshWidget();
        // TODO: if widget has changed inherit options
    }, { deep: true });
    watch(() => props.dashboardVariablesSchema, () => {
        if (props.initiated && props.editMode && !props.errorMode) refreshWidget();
    }, { deep: true });
};
