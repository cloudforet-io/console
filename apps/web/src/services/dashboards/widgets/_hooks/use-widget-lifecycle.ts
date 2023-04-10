import type { UnwrapRef } from 'vue';
import {
    onUnmounted, watch,
} from 'vue';

import { isEqual } from 'lodash';

import type { Currency } from '@/store/modules/display/config';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { InheritOptions, WidgetProps, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';


interface UseWidgetLifecycleOptions {
    disposeWidget?: () => void;
    refreshWidget: () => void;
    props: WidgetProps;
    state: UnwrapRef<WidgetState>;
    onCurrencyUpdate?: (current?: Currency, previous?: Currency) => void|Promise<void>;
}


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const checkRefreshableByDashboardVariables = (
    inheritOptions: InheritOptions,
    after?: DashboardVariables|DashboardVariablesSchema,
    before?: DashboardVariables|DashboardVariablesSchema,
): boolean => {
    let _refresh = false;
    Object.values(inheritOptions).forEach((inheritOption) => {
        if (_refresh) return;
        const _variableKey = inheritOption.variable_info?.key ?? '';
        const _after = after?.[_variableKey];
        const _before = before?.[_variableKey];
        if (!_variableKey || (!_after && !_before)) return;
        if (!isEqual(_after, _before)) _refresh = true;
    });
    return _refresh;
};
const checkRefreshableByDashboardVariableSchema = (
    inheritOptions: InheritOptions,
    widgetConfig: WidgetConfig,
    widgetKey: string,
    after?: DashboardVariables|DashboardVariablesSchema,
    before?: DashboardVariables|DashboardVariablesSchema,
): boolean => {
    let _refresh = false;
    const targetWidgetInfo = dashboardDetailState.dashboardWidgetInfoList.find((d) => d.widget_key === widgetKey);
    if (!targetWidgetInfo) return false;
    Object.entries(inheritOptions).forEach(([property, { enabled, variable_info }]) => {
        if (!enabled) return;

        const _variableKey = variable_info?.key;
        if (!_variableKey) return;

        const _after = after?.properties?.[_variableKey];
        const _before = before?.properties?.[_variableKey];
        if (!isEqual(_after, _before)) _refresh = true;

        /* update widget info (only when options in widget config) */
        const optionsSchemaProperties: string[] = Object.keys(widgetConfig.options_schema?.schema.properties ?? {});
        const isInWidgetOptionsSchema = optionsSchemaProperties.some((d) => d.includes(property));
        if (!isInWidgetOptionsSchema) return;

        if (_before?.use === false && _after?.use === true) { /* checked case */
            targetWidgetInfo.inherit_options[property] = { enabled: true, variable_info: { key: _variableKey } };
            dashboardDetailStore.updateWidgetInfo(widgetKey, targetWidgetInfo);
        } else if (_before?.use === true && _after?.use === false) { /* unchecked case */
            const isFixedProperty: boolean = widgetConfig.options_schema?.fixed_properties?.includes(property) ?? false;
            if (isFixedProperty) { /* fixed property case */
                console.log(property, widgetConfig.options?.[property]);
                targetWidgetInfo.widget_options[property] = widgetConfig.options?.[property] ?? undefined; // set default value to option
            } else { /* not-fixed property case */
                targetWidgetInfo.schema_properties.splice(targetWidgetInfo.schema_properties.indexOf(property), 1);
            }
            targetWidgetInfo.inherit_options[property] = { enabled: false };
            dashboardDetailStore.updateWidgetInfo(widgetKey, targetWidgetInfo);
        }
    });
    return _refresh;
};

export const useWidgetLifecycle = ({
    disposeWidget,
    refreshWidget,
    props,
    state,
    onCurrencyUpdate,
}: UseWidgetLifecycleOptions): void => {
    onUnmounted(() => {
        if (disposeWidget) disposeWidget();
    });
    watch(() => props.dashboardVariables, (after, before) => {
        if (!props.initiated || props.errorMode || !props.inheritOptions) return;
        const _isRefreshable = checkRefreshableByDashboardVariables(props.inheritOptions, after, before);
        if (_isRefreshable) refreshWidget();
    }, { deep: true });
    watch(() => props.dashboardVariablesSchema, (after, before) => {
        if (!props.initiated || !props.editMode || !props.inheritOptions) return;
        const _isRefreshable = checkRefreshableByDashboardVariableSchema(props.inheritOptions, state.widgetConfig, props.widgetKey, after, before);
        if (props.errorMode) return;
        if (_isRefreshable) refreshWidget();
    }, { deep: true });
    if (state.settings) {
        watch(() => state.settings, (current, previous) => {
            if (!current || !previous) return;
            if (current.date_range.start !== previous.date_range.start || current.date_range.end !== previous.date_range.end) {
                refreshWidget();
            } else if (onCurrencyUpdate && current?.currency?.value !== previous?.currency?.value) {
                onCurrencyUpdate(current.currency.value, previous.currency.value);
            }
        });
    }
};
