import type { UnwrapRef } from 'vue';
import {
    onUnmounted, watch,
} from 'vue';

import {
    cloneDeep, isEmpty, isEqual, union,
} from 'lodash';

import type { Currency } from '@/store/modules/display/config';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    InheritOptions, WidgetProps, WidgetConfig, DashboardLayoutWidgetInfo, WidgetFilterKey,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterSchemaPropertyName } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import type { WidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';


interface UseWidgetLifecycleOptions {
    disposeWidget?: () => void;
    refreshWidget: () => void;
    props: WidgetProps;
    state: UnwrapRef<WidgetState>;
    onCurrencyUpdate?: (current?: Currency, previous?: Currency) => void|Promise<void>;
}

const dashboardDetailStore = useDashboardDetailInfoStore();

const checkRefreshableByDashboardVariables = (
    inheritOptions: InheritOptions,
    after?: DashboardVariables,
    before?: DashboardVariables,
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

/* Dashboard Variable Schema */
const getUpdatedDashboardVariableSchemaProperties = (
    after?: DashboardVariablesSchema,
    before?: DashboardVariablesSchema,
): [WidgetFilterKey[], WidgetFilterKey[], WidgetFilterKey[]] => {
    const added: WidgetFilterKey[] = [];
    const deleted: WidgetFilterKey[] = [];
    const changed: WidgetFilterKey[] = [];
    const afterVariables = Object.keys(after?.properties ?? {});
    const beforeVariables = Object.keys(before?.properties ?? {});
    union(afterVariables, beforeVariables).forEach((variable) => {
        if (!after?.properties[variable].use && !before?.properties[variable].use) return;
        if (after?.properties[variable].use && before?.properties[variable].use) {
            if (isEqual(after?.properties[variable], before?.properties[variable])) return; /* Not changed variable */
            changed.push(variable as WidgetFilterKey);
        } else if (after?.properties[variable].use && !before?.properties[variable].use) {
            added.push(variable as WidgetFilterKey);
        } else {
            deleted.push(variable as WidgetFilterKey);
        }
    });
    return [added, deleted, changed];
};
const isAffectedByChangedVariableSchemaProperties = (
    dashboardVariables: string[],
    inheritOptions: InheritOptions,
): boolean => {
    const enabledInheritOptions = Object.entries(inheritOptions)
        .filter(([, v]) => v.enabled)
        .map(([, v]) => v.variable_info?.key as WidgetFilterKey);
    if (!enabledInheritOptions.length || !enabledInheritOptions.some((d) => dashboardVariables.includes(d))) return false;
    return true;
};
const updateWidgetByAddedVariableSchemaProperties = (
    dashboardVariables: WidgetFilterKey[],
    widgetInfo: DashboardLayoutWidgetInfo,
    widgetKey: string,
    widgetConfig: WidgetConfig,
): boolean => {
    const _widgetInfo = cloneDeep(widgetInfo);
    const optionsSchemaProperties: string[] = Object.keys(widgetConfig.options_schema?.schema.properties ?? {});
    let isAffected = false;
    dashboardVariables.forEach((variableKey) => {
        const property = getWidgetFilterSchemaPropertyName(variableKey);
        const isInWidgetOptionsSchema = optionsSchemaProperties.some((d) => d.includes(property));
        if (!isInWidgetOptionsSchema) return;

        // enable widget option that match added variable
        isAffected = true;
        _widgetInfo.inherit_options[property] = { enabled: true, variable_info: { key: variableKey } };
        _widgetInfo.schema_properties.push(property);
    });
    if (isAffected) {
        dashboardDetailStore.updateWidgetInfo(widgetKey, _widgetInfo);
    }
    return isAffected;
};
const updateWidgetByDeletedVariableSchemaProperties = (
    dashboardVariables: WidgetFilterKey[],
    widgetInfo: DashboardLayoutWidgetInfo,
    widgetKey: string,
    widgetConfig: WidgetConfig,
    inheritOptions: InheritOptions,
    dashboardVariablesSchema?: DashboardVariablesSchema,
): boolean => {
    // check whether the deleted variable exists in inherit options
    const _widgetInfo = cloneDeep(widgetInfo);
    const enabledInheritOptions = Object.entries(inheritOptions)
        .filter(([, v]) => v.enabled)
        .map(([, v]) => v.variable_info?.key as WidgetFilterKey);
    if (!enabledInheritOptions.length || !enabledInheritOptions.some((d) => dashboardVariables.includes(d))) {
        return false;
    }

    // delete or update options using deleted variables
    dashboardVariables.forEach((variableKey) => {
        const property = getWidgetFilterSchemaPropertyName(variableKey);
        const isFixedProperty: boolean = widgetConfig.options_schema?.fixed_properties?.includes(property) ?? false;
        if (isFixedProperty) { /* fixed property case */
            _widgetInfo.widget_options[property] = widgetConfig.options?.[property] ?? undefined; // set default value to fixed option
        } else { /* non-fixed property case */
            const _schemaProperties = [..._widgetInfo.schema_properties];
            _widgetInfo.schema_properties = _schemaProperties.filter((d) => d !== property);
        }
        _widgetInfo.inherit_options[property] = { enabled: false };
    });

    dashboardDetailStore.updateWidgetInfo(widgetKey, _widgetInfo);
    validateWidget(_widgetInfo.inherit_options, widgetKey, widgetConfig, dashboardVariablesSchema);
    return true;
};
const validateWidget = (
    inheritOptions: InheritOptions,
    widgetKey: string,
    widgetConfig: WidgetConfig,
    dashboardVariableSchema?: DashboardVariablesSchema,
) => {
    const _widgetSchemaErrorMap = getWidgetInheritOptionsErrorMap(inheritOptions, widgetConfig.options_schema?.schema, dashboardVariableSchema);
    dashboardDetailStore.updateWidgetValidation(isEmpty(_widgetSchemaErrorMap), widgetKey);
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
        if (!props.initiated || !props.editMode || !props.inheritOptions || isEqual(after, before)) return;
        if (!state.widgetInfo) return;

        const [
            addedVariableSchemaProperties,
            deletedVariableSchemaProperties,
            changedVariableSchemaProperties,
        ] = getUpdatedDashboardVariableSchemaProperties(after, before);
        let isWidgetOptionChanged; let isWidgetOptionAdded; let isWidgetOptionDeleted;
        if (addedVariableSchemaProperties.length) {
            isWidgetOptionAdded = updateWidgetByAddedVariableSchemaProperties(addedVariableSchemaProperties, state.widgetInfo, props.widgetKey, state.widgetConfig);
        }
        if (deletedVariableSchemaProperties.length) {
            isWidgetOptionDeleted = updateWidgetByDeletedVariableSchemaProperties(deletedVariableSchemaProperties, state.widgetInfo, props.widgetKey, state.widgetConfig, props.inheritOptions, after);
        }
        if (changedVariableSchemaProperties.length) {
            isWidgetOptionChanged = isAffectedByChangedVariableSchemaProperties(changedVariableSchemaProperties, props.inheritOptions);
        }
        if (isWidgetOptionAdded || isWidgetOptionDeleted || isWidgetOptionChanged) refreshWidget();
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
