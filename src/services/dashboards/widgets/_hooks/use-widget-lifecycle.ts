import {
    onUnmounted, watch,
} from 'vue';

import { isEqual } from 'lodash';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import type { InheritOptions, WidgetProps } from '@/services/dashboards/widgets/_configs/config';


interface UseWidgetLifecycleOptions {
    disposeWidget?: () => void;
    refreshWidget: () => void;
    props: WidgetProps;
}

const checkRefreshable = (
    inheritOptions: InheritOptions,
    after?: DashboardVariables|DashboardVariablesSchema,
    before?: DashboardVariables|DashboardVariablesSchema,
    isSchema = false,
): boolean => {
    let _refresh = false;
    Object.values(inheritOptions).forEach((inheritOption) => {
        if (_refresh) return;
        const _variableKey = inheritOption.variable_info?.key ?? '';
        const _after = isSchema ? after?.properties?.[_variableKey] : after?.[_variableKey];
        const _before = isSchema ? before?.properties?.[_variableKey] : before?.[_variableKey];
        if (!_variableKey || (!_after && !_before)) return;
        if (!isEqual(_after, _before)) _refresh = true;
    });
    return _refresh;
};

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
        const _isRefreshable = checkRefreshable(props.inheritOptions, after, before);
        if (_isRefreshable) refreshWidget();
    }, { deep: true });
    watch(() => props.dashboardVariablesSchema, (after, before) => {
        if (!props.initiated || props.errorMode || !props.editMode || !props.inheritOptions) return;
        const _isRefreshable = checkRefreshable(props.inheritOptions, after, before, true);
        if (_isRefreshable) refreshWidget();
    }, { deep: true });
};
