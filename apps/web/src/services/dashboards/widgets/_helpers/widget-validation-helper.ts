import {
    cloneDeep, isEmpty, isEqual, union,
} from 'lodash';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { getUpdatedWidgetInfo } from '@/services/dashboards/shared/helpers/dashboard-widget-info-helper';
import type {
    InheritOptions, WidgetOptionsSchema, DashboardLayoutWidgetInfo, WidgetConfig, WidgetFilterKey,
} from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetOptionName,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


export interface InheritOptionsErrorMap {
    [propertyName: string]: string|undefined;
}

export const getWidgetInheritOptionsErrorMap = (
    schemaProperties: string[],
    inheritOptions?: InheritOptions,
    widgetOptionsSchema?: WidgetOptionsSchema['schema'],
    dashboardVariablesSchema?: DashboardVariablesSchema,
    errorMessage?: string,
): InheritOptionsErrorMap => {
    if (!inheritOptions || isEmpty(inheritOptions)) {
        return {};
    }
    const errorMap: InheritOptionsErrorMap = {};
    schemaProperties.forEach((propertyName) => {
        if (!inheritOptions[propertyName]?.enabled) return;

        const variableKey = inheritOptions[propertyName]?.variable_info?.key;
        if (!variableKey) return;
        if (!dashboardVariablesSchema?.properties?.[variableKey]?.use) {
            errorMap[propertyName] = errorMessage;
            return;
        }

        const variableType = dashboardVariablesSchema.properties[variableKey].selection_type === 'MULTI' ? 'array' : 'string';
        const widgetPropertyType = widgetOptionsSchema?.properties?.[propertyName]?.type;
        if (variableType !== widgetPropertyType) {
            errorMap[propertyName] = errorMessage;
        }
    });
    return errorMap;
};


interface ValidateWidgetByVariablesSchemaUpdateOptions {
    updatedVariablesSchema?: DashboardVariablesSchema;
    previousVariablesSchema?: DashboardVariablesSchema;
    widgetConfig: WidgetConfig;
    widgetInfo: Pick<DashboardLayoutWidgetInfo, 'inherit_options'|'schema_properties'|'widget_options'>;
}

export const validateWidgetByVariablesSchemaUpdate = ({
    updatedVariablesSchema,
    previousVariablesSchema,
    widgetConfig,
    widgetInfo,
}: ValidateWidgetByVariablesSchemaUpdateOptions) => {
    const [
        addedVariableSchemaProperties,
        deletedVariableSchemaProperties,
        changedVariableSchemaProperties,
    ] = getUpdatedDashboardVariableSchemaProperties(updatedVariablesSchema, previousVariablesSchema);
    let isWidgetOptionChanged: boolean|undefined;
    let isWidgetOptionAdded: boolean|undefined;
    let isWidgetOptionDeleted: boolean|undefined;
    const newWidgetInfo: Partial<DashboardLayoutWidgetInfo> = {
        inherit_options: cloneDeep(widgetInfo.inherit_options),
        schema_properties: widgetInfo.schema_properties ? [...widgetInfo.schema_properties] : [],
        widget_options: cloneDeep(widgetInfo.widget_options),
    };
    if (addedVariableSchemaProperties.length) {
        const affected = getAffectedWidgetInfoByAddingVariableSchemaProperty(
            addedVariableSchemaProperties,
            widgetConfig,
            widgetInfo,
        );
        isWidgetOptionAdded = !!affected;
        if (affected) {
            newWidgetInfo.inherit_options = affected.inherit_options;
            newWidgetInfo.schema_properties = affected.schema_properties;
        }
    }
    if (deletedVariableSchemaProperties.length) {
        const affected = getAffectedWidgetInfoByDeletingVariableSchemaProperty(
            deletedVariableSchemaProperties,
            widgetConfig,
            widgetInfo,
        );
        isWidgetOptionDeleted = !!affected;
        if (affected) {
            newWidgetInfo.inherit_options = affected.inherit_options;
            newWidgetInfo.schema_properties = affected.schema_properties;
            newWidgetInfo.widget_options = affected.widget_options;
        }
    }
    if (changedVariableSchemaProperties.length) {
        isWidgetOptionChanged = isAffectedByChangedVariableSchemaProperties(changedVariableSchemaProperties, widgetInfo);
    }

    const isWidgetUpdated = isWidgetOptionAdded || isWidgetOptionDeleted || isWidgetOptionChanged;
    const updatedWidgetInfo = getUpdatedWidgetInfo(widgetConfig, newWidgetInfo);
    const isValid = isWidgetUpdated && updatedWidgetInfo.inherit_options
        ? validateWidget(newWidgetInfo.schema_properties ?? [], updatedWidgetInfo.inherit_options, widgetConfig, updatedVariablesSchema)
        : undefined;

    return {
        isWidgetUpdated,
        isValid,
        updatedWidgetInfo: isEmpty(updatedWidgetInfo) ? undefined : updatedWidgetInfo,
    };
};

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
const getAffectedWidgetInfoByAddingVariableSchemaProperty = (
    dashboardVariables: WidgetFilterKey[],
    widgetConfig: WidgetConfig,
    widgetInfo: Pick<DashboardLayoutWidgetInfo, 'inherit_options'|'schema_properties'>,
): Pick<DashboardLayoutWidgetInfo, 'inherit_options'|'schema_properties'>|undefined => {
    const _inheritOptions = cloneDeep(widgetInfo.inherit_options) ?? {};
    const _schemaProperties = widgetInfo.schema_properties ? [...widgetInfo.schema_properties] : [];
    const optionsSchemaProperties: string[] = Object.keys(widgetConfig.options_schema?.schema.properties ?? {});
    let isAffected = false;
    dashboardVariables.forEach((variableKey) => {
        const property = getWidgetOptionName(variableKey);

        const isInWidgetOptionsSchema = optionsSchemaProperties.some((d) => d.includes(property));
        if (!isInWidgetOptionsSchema) return; // not exist in widget options schema

        if (_schemaProperties.includes(property)) return; // already added property

        // enable widget option that match added variable
        isAffected = true;
        _inheritOptions[property] = { enabled: true, variable_info: { key: variableKey } };
        _schemaProperties.push(property);
    });
    return isAffected ? {
        inherit_options: _inheritOptions,
        schema_properties: _schemaProperties,
    } : undefined;
};
const getAffectedWidgetInfoByDeletingVariableSchemaProperty = (
    dashboardVariables: WidgetFilterKey[],
    widgetConfig: WidgetConfig,
    widgetInfo: Pick<DashboardLayoutWidgetInfo, 'inherit_options'|'schema_properties'|'widget_options'>,
): Pick<DashboardLayoutWidgetInfo, 'inherit_options'|'schema_properties'|'widget_options'>|undefined => {
    const _widgetOptions = cloneDeep(widgetInfo.widget_options) ?? {};
    const _inheritOptions = cloneDeep(widgetInfo.inherit_options) ?? {};
    const _schemaProperties = widgetInfo.schema_properties ? [...widgetInfo.schema_properties] : [];

    // delete or update options using deleted variables
    dashboardVariables.forEach((variableKey) => {
        const property = getWidgetOptionName(variableKey);
        const isFixedProperty: boolean = widgetConfig.options_schema?.fixed_properties?.includes(property) ?? false;

        // do nothing if inherit option is already disabled
        if (!_inheritOptions[property]?.enabled) return;

        // remove option from schemaProperties and revert inherit option if the option is not fixed property
        if (!isFixedProperty) {
            const propertyIdx = _schemaProperties.indexOf(property);
            if (propertyIdx === -1) return; // already deleted property
            _schemaProperties.splice(_schemaProperties.indexOf(property), 1); // delete property from schemaProperties
            // just initiate inherit option since the option is deleted from schemaProperties
            _inheritOptions[property] = widgetConfig.inherit_options?.[property] as InheritOptions['string'];
        }
    });

    return {
        schema_properties: _schemaProperties,
        inherit_options: _inheritOptions,
        widget_options: _widgetOptions,
    };
};
const isAffectedByChangedVariableSchemaProperties = (
    dashboardVariables: string[],
    widgetInfo: Pick<DashboardLayoutWidgetInfo, 'inherit_options'>,
): boolean => {
    const enabledInheritOptions = Object.entries(widgetInfo.inherit_options ?? {})
        .filter(([, v]) => v.enabled)
        .map(([, v]) => v.variable_info?.key as WidgetFilterKey);
    if (!enabledInheritOptions.length || !enabledInheritOptions.some((d) => dashboardVariables.includes(d))) return false;
    return true;
};
const validateWidget = (
    schemaProperties: string[],
    inheritOptions: InheritOptions,
    widgetConfig: WidgetConfig,
    dashboardVariableSchema?: DashboardVariablesSchema,
): boolean => {
    const _widgetSchemaErrorMap = getWidgetInheritOptionsErrorMap(schemaProperties, inheritOptions, widgetConfig.options_schema?.schema, dashboardVariableSchema, 'Invalid');
    return isEmpty(_widgetSchemaErrorMap);
};
