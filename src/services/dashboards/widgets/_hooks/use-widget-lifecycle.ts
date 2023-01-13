import {
    onUnmounted, watch,
} from 'vue';

import { isEqual } from 'lodash';

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
    watch(() => props.dashboardVariables, (after, before) => {
        if (!props.initiated || props.errorMode || !props.inheritOptions) return;
        let _refresh = false;
        Object.values(props.inheritOptions).forEach((inheritOption) => {
            if (_refresh) return;
            const _variableKey = inheritOption.variable_info?.key;
            if (!_variableKey || (!after?.[_variableKey]) && !before?.[_variableKey]) return;
            const _afterVariable = after?.[_variableKey];
            const _beforeVariable = before?.[_variableKey];
            if (!isEqual(_afterVariable, _beforeVariable)) _refresh = true;
        });
        if (_refresh) refreshWidget();
    }, { deep: true });
    watch(() => props.dashboardVariablesSchema, () => {
        if (props.initiated && props.editMode && !props.errorMode) refreshWidget();
    }, { deep: true });
};
