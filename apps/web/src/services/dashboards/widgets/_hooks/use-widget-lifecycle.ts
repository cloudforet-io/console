import type { Ref } from 'vue';
import {
    onUnmounted, watch,
} from 'vue';

import { isEqual } from 'lodash';

import type { Currency } from '@/store/modules/display/config';

import type { DashboardSettings, DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { InheritOptions, WidgetProps, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';


interface UseWidgetLifecycleOptions {
    disposeWidget?: () => void;
    refreshWidget: () => void;
    props: WidgetProps;
    widgetConfig: Ref<WidgetConfig>;
    settings?: Ref<DashboardSettings>;
    onCurrencyUpdate?: (current?: Currency, previous?: Currency) => void|Promise<void>;
}


const dashboardDetailStore = useDashboardDetailInfoStore();

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
    optionsSchemaProperty: string[],
    widgetKey: string,
    after?: DashboardVariables|DashboardVariablesSchema,
    before?: DashboardVariables|DashboardVariablesSchema,
): boolean => {
    let _refresh = false;
    Object.entries(inheritOptions).forEach(([optionName]) => {
        if (_refresh) return;
        const _variableKey = optionName.replace('filters.', '');
        const _after = after?.properties?.[_variableKey];
        const _before = before?.properties?.[_variableKey];

        if (!_variableKey || (!_after && !_before)) return;
        if (!isEqual(_after, _before)) _refresh = true;

        // set inherit options to widget when new dashboard variable added (only when options in widget config)
        const isInOptionsSchema = optionsSchemaProperty.some((d) => d.includes(_variableKey));
        if (isInOptionsSchema && _before?.use === false && _after?.use === true) {
            const targetWidgetInfo = dashboardDetailStore.$state.dashboardWidgetInfoList.find((d) => d.widget_key === widgetKey);
            if (targetWidgetInfo) {
                targetWidgetInfo.inherit_options[optionName] = { enabled: true, variable_info: { key: _variableKey } };
                dashboardDetailStore.updateWidgetInfo(widgetKey, targetWidgetInfo);
            }
        }
    });
    return _refresh;
};

export const useWidgetLifecycle = ({
    disposeWidget,
    refreshWidget,
    props,
    widgetConfig,
    settings,
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
        if (!props.initiated || props.errorMode || !props.editMode || !props.inheritOptions) return;
        const optionsSchemaProperty = Object.keys(widgetConfig.value.options_schema?.schema.properties ?? {});
        const _isRefreshable = checkRefreshableByDashboardVariableSchema(props.inheritOptions, optionsSchemaProperty, props.widgetKey, after, before);
        if (_isRefreshable) refreshWidget();
    }, { deep: true });
    if (settings && onCurrencyUpdate) {
        watch(settings, (current, previous) => {
            if (current && previous && current?.currency?.value !== previous?.currency?.value) {
                onCurrencyUpdate(current.currency.value, previous.currency.value);
            }
        });
    }
};
