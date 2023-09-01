import type { UnwrapRef } from 'vue';
import {
    onUnmounted, watch,
} from 'vue';

import {
    cloneDeep, isEmpty, isEqual, union,
} from 'lodash';

import { i18n } from '@/translations';

import type { Currency } from '@/store/modules/settings/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    InheritOptions, WidgetProps, WidgetConfig, WidgetFilterKey, WidgetOptions, DashboardLayoutWidgetInfo, WidgetEmit,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterSchemaPropertyName } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import type { WidgetBaseState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-base-state';


interface UseWidgetLifecycleOptions<T extends WidgetBaseState = WidgetBaseState> {
    props: WidgetProps;
    emit: WidgetEmit;
    widgetState: UnwrapRef<T>;
    disposeWidget?: () => void;
    refreshWidget: () => any;
    onCurrencyUpdate?: (current?: Currency, previous?: Currency) => void|Promise<void>;
    redrawChart?: () => void;
    redrawOnLanguageChange?: boolean;
}

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
const getAffectedWidgetInfoByAddingVariableSchemaProperty = (
    dashboardVariables: WidgetFilterKey[],
    inheritOptions: InheritOptions,
    schemaProperties: string[],
    widgetConfig: WidgetConfig,
): Partial<DashboardLayoutWidgetInfo>|undefined => {
    const _inheritOptions = cloneDeep(inheritOptions);
    const _schemaProperties = [...schemaProperties];
    const optionsSchemaProperties: string[] = Object.keys(widgetConfig.options_schema?.schema.properties ?? {});
    let isAffected = false;
    dashboardVariables.forEach((variableKey) => {
        const property = getWidgetFilterSchemaPropertyName(variableKey);
        const isInWidgetOptionsSchema = optionsSchemaProperties.some((d) => d.includes(property));
        if (!isInWidgetOptionsSchema) return;

        // enable widget option that match added variable
        isAffected = true;
        _inheritOptions[property] = { enabled: true, variable_info: { key: variableKey } };
        _schemaProperties.push(property);
    });
    return isAffected ? {
        inherit_options: _inheritOptions,
        schema_properties: _schemaProperties,
    }
        : undefined;
};
const getAffectedWidgetInfoByDeletingVariableSchemaProperty = (
    dashboardVariables: WidgetFilterKey[],
    widgetOptions: WidgetOptions,
    schemaProperties: string[],
    widgetConfig: WidgetConfig,
    inheritOptions: InheritOptions,
): Partial<DashboardLayoutWidgetInfo>|undefined => {
    // check whether the deleted variable exists in inherit options
    const enabledInheritOptions = Object.entries(inheritOptions)
        .filter(([, v]) => v.enabled)
        .map(([, v]) => v.variable_info?.key as WidgetFilterKey);
    if (!enabledInheritOptions.length || !enabledInheritOptions.some((d) => dashboardVariables.includes(d))) {
        return undefined;
    }

    const _widgetOptions = cloneDeep(widgetOptions);
    const _inheritOptions = cloneDeep(inheritOptions);
    let _schemaProperties = [...schemaProperties];
    // delete or update options using deleted variables
    dashboardVariables.forEach((variableKey) => {
        const property = getWidgetFilterSchemaPropertyName(variableKey);
        const isFixedProperty: boolean = widgetConfig.options_schema?.fixed_properties?.includes(property) ?? false;

        if (isFixedProperty) { /* fixed property case */
            _widgetOptions[property] = widgetConfig.options?.[property] ?? undefined; // set default value to fixed option
        } else { /* non-fixed property case */
            _schemaProperties = _schemaProperties.filter((d) => d !== property);
        }
        _inheritOptions[property] = { enabled: false };
    });

    return {
        schema_properties: _schemaProperties,
        inherit_options: _inheritOptions,
        widget_options: _widgetOptions,
    };
};
const validateWidget = (
    inheritOptions: InheritOptions,
    widgetConfig: WidgetConfig,
    dashboardVariableSchema?: DashboardVariablesSchema,
): boolean => {
    const _widgetSchemaErrorMap = getWidgetInheritOptionsErrorMap(inheritOptions, widgetConfig.options_schema?.schema, dashboardVariableSchema);
    return isEmpty(_widgetSchemaErrorMap);
};


export const useWidgetLifecycle = ({
    props,
    emit,
    widgetState,
    disposeWidget,
    refreshWidget,
    onCurrencyUpdate,
    redrawChart,
    redrawOnLanguageChange,
}: UseWidgetLifecycleOptions): void => {
    const refreshWidgetAndEmitEvent = () => {
        const newData = refreshWidget();
        emit('update-data', newData);
    };

    onUnmounted(() => {
        if (disposeWidget) disposeWidget();
    });

    watch(() => props.dashboardVariables, (after, before) => {
        if (!props.initiated || props.errorMode || !props.inheritOptions || props.disableRefreshOnVariableChange) return;
        const _isRefreshable = checkRefreshableByDashboardVariables(props.inheritOptions, after, before);
        if (_isRefreshable) refreshWidgetAndEmitEvent();
    }, { deep: true });

    watch(() => props.dashboardVariablesSchema, (after, before) => {
        if (!props.editMode || !props.inheritOptions || !props.schemaProperties || !props.options
            || isEqual(after, before) || props.disableRefreshOnVariableChange) return;

        const [
            addedVariableSchemaProperties,
            deletedVariableSchemaProperties,
            changedVariableSchemaProperties,
        ] = getUpdatedDashboardVariableSchemaProperties(after, before);
        let isWidgetOptionChanged: boolean|undefined;
        let isWidgetOptionAdded: boolean|undefined;
        let isWidgetOptionDeleted: boolean|undefined;
        if (addedVariableSchemaProperties.length) {
            const affectedWidgetInfo = getAffectedWidgetInfoByAddingVariableSchemaProperty(
                addedVariableSchemaProperties,
                props.inheritOptions,
                props.schemaProperties,
                widgetState.widgetConfig,
            );
            isWidgetOptionAdded = !!affectedWidgetInfo;
            if (affectedWidgetInfo) {
                emit('update-widget-info', affectedWidgetInfo);
            }
        }
        if (deletedVariableSchemaProperties.length) {
            const affectedWidgetInfo = getAffectedWidgetInfoByDeletingVariableSchemaProperty(
                deletedVariableSchemaProperties,
                props.options,
                props.schemaProperties,
                widgetState.widgetConfig,
                props.inheritOptions,
            );
            isWidgetOptionDeleted = !!affectedWidgetInfo;
            if (affectedWidgetInfo) {
                emit('update-widget-info', affectedWidgetInfo);
                const isValid = validateWidget(affectedWidgetInfo.inherit_options ?? {}, widgetState.widgetConfig, after);
                emit('update-widget-validation', isValid);
            }
        }
        if (changedVariableSchemaProperties.length) {
            isWidgetOptionChanged = isAffectedByChangedVariableSchemaProperties(changedVariableSchemaProperties, props.inheritOptions);
        }

        if (!props.initiated) return;
        if (isWidgetOptionAdded || isWidgetOptionDeleted || isWidgetOptionChanged) {
            refreshWidgetAndEmitEvent();
        }
    }, { deep: true });

    if (widgetState.settings) {
        watch(() => widgetState.settings, (current, previous) => {
            if (!current || !previous || props.disableRefreshOnVariableChange) return;
            if (current.date_range.start !== previous.date_range.start || current.date_range.end !== previous.date_range.end) {
                refreshWidgetAndEmitEvent();
            } else if (onCurrencyUpdate && current?.currency?.value !== previous?.currency?.value) {
                onCurrencyUpdate();
            }
        });
    }

    if (redrawOnLanguageChange) {
        try {
            if (!redrawChart) throw Error('redrawChart is required');
            watch(() => i18n.locale, async () => {
                redrawChart();
            });
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }
};
