import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { ReferenceMap } from '@/store/modules/reference/type';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type {
    useReferenceStore,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/composables/use-reference-store';
import type {
    InheritOptions,
    WidgetOptionsSchema,
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/config';

type ReferenceStoreState = ReturnType<typeof useReferenceStore>['referenceStoreState'];

const refineFilterOptionSchema = (propertyName: string, propertySchema: JsonSchema['properties'], referenceStoreState: ReferenceStoreState): JsonSchema['properties'] => {
    const referenceType = propertyName.replace('filters.', '');

    // use reference store data if exists
    const referenceData: ReferenceMap = referenceStoreState[referenceType];
    let menuItems: MenuItem[] = [];
    let _enum: string[] = [];
    if (referenceData) {
        menuItems = Object.values(referenceData).map((d) => ({
            name: d.key, label: d.label,
        }));
        _enum = Object.keys(referenceData);
    }

    if (propertySchema.type === 'array') {
        return {
            ...propertySchema,
            items: { enum: _enum.length ? _enum : [null] },
            menuItems,
        };
    }
    return {
        ...propertySchema,
        enum: _enum.length ? _enum : [null],
        menuItems,
    };
};
const refineOptionSchema = (propertyName: string, propertySchema: JsonSchema['properties'], referenceStoreState: ReferenceStoreState): JsonSchema['properties'] => {
    if (propertyName.startsWith('filters.')) return refineFilterOptionSchema(propertyName, propertySchema, referenceStoreState);
    return propertySchema;
};
const refineOptionSchemaByVariablesSchema = (propertySchema: JsonSchema['properties'], variablesSchema: DashboardVariablesSchema) => {
    const availableVariables = Object.entries(variablesSchema.properties)
        .filter(([, d]) => {
            if (!d.use) return false;
            const variableType = d.selection_type === 'MULTI' ? 'array' : 'string';
            return propertySchema.type === variableType;
        });
    const _enum = availableVariables.map(([key]) => key);
    return {
        title: propertySchema.title,
        type: 'string',
        enum: _enum.length ? _enum : [null],
        menuItems: availableVariables.map(([key, val]) => ({
            name: key, label: val.name,
        })),
        default: undefined,
    };
};

export const getWidgetOptionSchema = (
    propertyName: string,
    propertySchema: JsonSchema['properties'],
    variablesSchema: DashboardVariablesSchema,
    referenceStoreState: ReferenceStoreState,
    isInherit: boolean,
) => {
    let refinedPropertySchema;
    if (isInherit) {
        // inherit case
        refinedPropertySchema = refineOptionSchemaByVariablesSchema(propertySchema, variablesSchema);
    } else {
        // non inherit case
        refinedPropertySchema = refineOptionSchema(propertyName, propertySchema, referenceStoreState);
    }
    return refinedPropertySchema;
};
export const getRefinedWidgetOptionsSchema = (
    referenceStoreState: ReferenceStoreState,
    widgetOptionsSchema: WidgetOptionsSchema,
    variablesSchema: DashboardVariablesSchema,
    inheritOptions: InheritOptions,
    defaultSchemaProperties: string[],
): WidgetOptionsSchema['schema'] => {
    const schema = widgetOptionsSchema?.schema;

    const refinedJsonSchema: WidgetOptionsSchema['schema'] = {
        type: 'object',
        properties: {},
        required: schema?.required ?? [],
        order: defaultSchemaProperties as WidgetOptionsSchemaProperty[],
    };
    if (!schema?.properties) return refinedJsonSchema;

    // refine each property schema
    Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
        // set properties declared in defaultSchemaProperties only
        if (!defaultSchemaProperties.includes(propertyName)) return;
        const isInherit = !!inheritOptions[propertyName]?.enabled;
        refinedJsonSchema.properties[propertyName] = getWidgetOptionSchema(propertyName, propertySchema, variablesSchema, referenceStoreState, isInherit);
    });

    return refinedJsonSchema;
};
