import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { ReferenceMap } from '@/store/modules/reference/type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    useReferenceStore,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-reference-store';
import type {
    InheritOptions,
    WidgetOptionsSchema,
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/config';

type ReferenceStoreState = ReturnType<typeof useReferenceStore>['referenceStoreState'];

const refineFilterOptionSchema = (propertyName: string, propertySchema: JsonSchema, referenceStoreState: ReferenceStoreState): JsonSchema => {
    const referenceType = propertyName.replace('filters.', '');

    // use reference store data if exists
    const referenceData: ReferenceMap = referenceStoreState[referenceType];

    if (referenceData) {
        let menuItems: MenuItem[] = [];
        let _enum: string[] = [];

        menuItems = Object.values(referenceData).map((d) => ({
            name: d.key, label: d.label,
        }));
        _enum = Object.keys(referenceData);

        return {
            ...propertySchema,
            items: { enum: _enum.length ? _enum : [null] },
            menuItems,
        };
    }

    return propertySchema;
};
const refineOptionSchema = (propertyName: string, propertySchema: JsonSchema, referenceStoreState: ReferenceStoreState): JsonSchema => {
    if (propertyName.startsWith('filters.')) return refineFilterOptionSchema(propertyName, propertySchema, referenceStoreState);
    return propertySchema;
};
const refineOptionSchemaByVariablesSchema = (propertySchema: JsonSchema, variableKey: string, variablesSchema: DashboardVariablesSchema): JsonSchema => {
    const availableVariables = Object.entries(variablesSchema.properties)
        .filter(([, d]) => {
            if (!d.use) return false;
            const variableType = d.selection_type === 'MULTI' ? 'array' : 'string';
            return propertySchema.type === variableType;
        });
    const _enum = availableVariables.map(([key]) => key);
    const isVariableActivated = variablesSchema.properties[variableKey]?.use;
    return {
        title: propertySchema.title,
        type: 'string',
        enum: _enum.length ? _enum : [null],
        menuItems: availableVariables.map(([key, val]) => ({
            name: key, label: val.name,
        })),
        default: isVariableActivated ? variableKey : undefined,
    };
};

export const getWidgetOptionSchema = (
    propertyName: string,
    propertySchema: JsonSchema,
    variablesSchema: DashboardVariablesSchema,
    referenceStoreState: ReferenceStoreState,
    isInherit: boolean,
    projectId?: string,
): JsonSchema => {
    const variableKey = propertyName.replace('filters.', '');
    const _isProjectDashboard = projectId && variableKey === REFERENCE_TYPE_INFO.project.type;
    if (isInherit) { // inherit case
        const refinedPropertySchema = refineOptionSchemaByVariablesSchema(propertySchema, variableKey, variablesSchema);
        if (_isProjectDashboard) {
            return {
                ...refinedPropertySchema,
                disabled: true,
                default: REFERENCE_TYPE_INFO.project.type,
            };
        }
        return refinedPropertySchema;
    } // non inherit case
    return refineOptionSchema(propertyName, propertySchema, referenceStoreState);
};
export const getRefinedWidgetOptionsSchema = (
    referenceStoreState: ReferenceStoreState,
    widgetOptionsSchema: WidgetOptionsSchema,
    variablesSchema: DashboardVariablesSchema,
    inheritOptions: InheritOptions,
    schemaProperties: string[],
    projectId?: string,
): JsonSchema => {
    const schema = widgetOptionsSchema?.schema;

    // init schema
    const refinedJsonSchema: JsonSchema = {
        type: 'object',
        properties: {},
        required: [] as WidgetOptionsSchemaProperty[],
        order: schema?.order ?? schemaProperties as WidgetOptionsSchemaProperty[],
    };
    if (!schema?.properties) return refinedJsonSchema;

    // refine each property schema
    Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
        // set properties declared in schemaProperties only
        if (!schemaProperties.includes(propertyName as WidgetOptionsSchemaProperty)) return;
        const isInherit = !!inheritOptions[propertyName]?.enabled;
        const refinedWidgetOptionsSchema = getWidgetOptionSchema(propertyName, propertySchema, variablesSchema, referenceStoreState, isInherit, projectId);
        if (refinedWidgetOptionsSchema) {
            if (refinedJsonSchema.properties) refinedJsonSchema.properties[propertyName] = refinedWidgetOptionsSchema;
            refinedJsonSchema.required?.push(propertyName);
        }
    });

    return refinedJsonSchema;
};

