import type { TranslateResult } from 'vue-i18n';

import {
    cloneDeep, isEmpty, isEqual, union,
} from 'lodash';

import { i18n } from '@/translations';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    InheritOptions, WidgetOptionsSchema, DashboardLayoutWidgetInfo, WidgetConfig, WidgetFilterKey,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterSchemaPropertyName } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


export interface InheritOptionsErrorMap {
    [propertyName: string]: TranslateResult;
}

export const getWidgetInheritOptionsErrorMap = (
    inheritOptions?: InheritOptions,
    widgetOptionsSchema?: WidgetOptionsSchema['schema'],
    dashboardVariablesSchema?: DashboardVariablesSchema,
): InheritOptionsErrorMap => {
    if (!inheritOptions || isEmpty(inheritOptions)) {
        return {};
    }
    const errorMap: InheritOptionsErrorMap = {};
    Object.entries(inheritOptions).forEach(([propertyName, inheritOption]) => {
        if (!inheritOption?.enabled) return;

        const variableKey = inheritOption?.variable_info?.key;
        if (!variableKey) return;
        if (!dashboardVariablesSchema?.properties?.[variableKey]?.use) {
            errorMap[propertyName] = i18n.t('DASHBOARDS.WIDGET.VALIDATION_PROPERTY_NOT_EXIST');
            return;
        }

        const variableType = dashboardVariablesSchema.properties[variableKey].selection_type === 'MULTI' ? 'array' : 'string';
        const widgetPropertyType = widgetOptionsSchema?.properties?.[propertyName]?.type;
        if (variableType !== widgetPropertyType) {
            errorMap[propertyName] = i18n.t('DASHBOARDS.WIDGET.VALIDATION_PROPERTY_NOT_EXIST');
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
    const newWidgetInfo: Partial<DashboardLayoutWidgetInfo> = {};
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
    const isValid = isWidgetUpdated && newWidgetInfo.inherit_options
        ? validateWidget(newWidgetInfo.inherit_options, widgetConfig, updatedVariablesSchema)
        : undefined;

    return {
        isWidgetUpdated,
        isValid,
        updatedWidgetInfo: isEmpty(newWidgetInfo) ? undefined : newWidgetInfo,
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
    const _inheritOptions = cloneDeep(widgetInfo.inherit_options);
    const _schemaProperties = [...widgetInfo.schema_properties];
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
    } : undefined;
};
const getAffectedWidgetInfoByDeletingVariableSchemaProperty = (
    dashboardVariables: WidgetFilterKey[],
    widgetConfig: WidgetConfig,
    widgetInfo: Pick<DashboardLayoutWidgetInfo, 'inherit_options'|'schema_properties'|'widget_options'>,
): Pick<DashboardLayoutWidgetInfo, 'inherit_options'|'schema_properties'|'widget_options'>|undefined => {
    // check whether the deleted variable exists in inherit options
    const enabledInheritOptions = Object.entries(widgetInfo.inherit_options)
        .filter(([, v]) => v.enabled)
        .map(([, v]) => v.variable_info?.key as WidgetFilterKey);
    if (!enabledInheritOptions.length || !enabledInheritOptions.some((d) => dashboardVariables.includes(d))) {
        return undefined;
    }

    const _widgetOptions = cloneDeep(widgetInfo.widget_options);
    const _inheritOptions = cloneDeep(widgetInfo.inherit_options);
    let _schemaProperties = [...widgetInfo.schema_properties];
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
const isAffectedByChangedVariableSchemaProperties = (
    dashboardVariables: string[],
    widgetInfo: Pick<DashboardLayoutWidgetInfo, 'inherit_options'>,
): boolean => {
    const enabledInheritOptions = Object.entries(widgetInfo.inherit_options)
        .filter(([, v]) => v.enabled)
        .map(([, v]) => v.variable_info?.key as WidgetFilterKey);
    if (!enabledInheritOptions.length || !enabledInheritOptions.some((d) => dashboardVariables.includes(d))) return false;
    return true;
};
const validateWidget = (
    inheritOptions: InheritOptions,
    widgetConfig: WidgetConfig,
    dashboardVariableSchema?: DashboardVariablesSchema,
): boolean => {
    const _widgetSchemaErrorMap = getWidgetInheritOptionsErrorMap(inheritOptions, widgetConfig.options_schema?.schema, dashboardVariableSchema);
    return isEmpty(_widgetSchemaErrorMap);
};
