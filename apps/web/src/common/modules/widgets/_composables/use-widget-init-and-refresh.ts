import type { UnwrapRef } from 'vue';
import {
    onBeforeUnmount, onMounted, ref,
    watch,
} from 'vue';

import {
    debounce, isEqual,
} from 'lodash';

import type { DashboardVariables } from '@/schema/dashboard/_types/dashboard-type';
import type { InheritOptions } from '@/schema/dashboard/_types/widget-type';

import type { WidgetState } from '@/services/dashboards/widgets/_composables/use-widget/use-widget';
import type {
    WidgetProps, WidgetEmit,
} from '@/services/dashboards/widgets/_types/widget-type';


interface UseWidgetInitAndRefreshOptions<Data> {
    props: WidgetProps;
    emit: WidgetEmit;
    widgetState: UnwrapRef<WidgetState>;
    initWidget: (data?: Data) => Promise<Data>;
    refreshWidget: () => Promise<Data>;
    disposeWidget?: () => void;
}

export const useWidgetInitAndRefresh = <Data = any>({
    props,
    emit,
    widgetState,
    initWidget,
    refreshWidget,
    disposeWidget,
}: UseWidgetInitAndRefreshOptions<Data>): void => {
    const initiated = ref(false);

    const refreshWidgetAndEmitEvent = debounce(() => {
        const newData = refreshWidget();
        emit('refreshed', newData);
    }, 300);

    const stopVariablesWatch = watch(() => props.dashboardVariables, (after, before) => {
        if (!initiated.value || props.errorMode || !widgetState.inheritOptions || props.disableRefreshOnVariableChange) return;
        const _isRefreshable = checkRefreshableByDashboardVariables(widgetState.inheritOptions, after, before);
        if (_isRefreshable) refreshWidgetAndEmitEvent();
    }, { deep: true });

    const stopLoadingWatch = watch(() => props.loading, async (loading) => {
        if (!initiated.value && !loading) {
            const data = await initWidget(props.data);
            initiated.value = true;
            emit('initiated', data);
        }
    }, { immediate: true });

    let stopDashboardOptionsWatch;

    if (widgetState.dashboardOptions) {
        stopDashboardOptionsWatch = watch(() => widgetState.dashboardOptions, (current, previous) => {
            if (!current || !previous || props.disableRefreshOnVariableChange) return;
            if (current.date_range.start !== previous.date_range.start || current.date_range.end !== previous.date_range.end) {
                refreshWidgetAndEmitEvent();
            }
        });
    }

    // TODO: add widget options watch

    onBeforeUnmount(() => {
        if (disposeWidget) disposeWidget();
        stopVariablesWatch();
        stopLoadingWatch();
        if (stopDashboardOptionsWatch) stopDashboardOptionsWatch();
    });

    onMounted(() => {
        emit('mounted');
    });
};

const checkRefreshableByDashboardVariables = (
    inheritOptions: InheritOptions,
    after?: DashboardVariables,
    before?: DashboardVariables,
): boolean => {
    let _refresh = false;
    Object.values(inheritOptions).forEach((inheritOption) => {
        if (_refresh) return;
        const _variableKey = inheritOption.variable_key ?? '';
        const _after = after?.[_variableKey];
        const _before = before?.[_variableKey];
        if (!_variableKey || (!_after && !_before)) return;
        if (!isEqual(_after, _before)) _refresh = true;
    });
    return _refresh;
};
