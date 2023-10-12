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
    DashboardLayoutWidgetInfo,
} from '@/services/dashboards/widgets/_configs/config';

type ReferenceStoreState = ReturnType<typeof useReferenceStore>['referenceStoreState'];

const refineFilterOptionSchema = (propertyName: string, propertySchema: JsonSchema['properties'], referenceStoreState: ReferenceStoreState): JsonSchema['properties'] => {
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
const refineOptionSchema = (propertyName: string, propertySchema: JsonSchema['properties'], referenceStoreState: ReferenceStoreState): JsonSchema['properties'] => {
    if (propertyName.startsWith('filters.')) return refineFilterOptionSchema(propertyName, propertySchema, referenceStoreState);
    return propertySchema;
};
const refineOptionSchemaByVariablesSchema = (propertySchema: JsonSchema['properties'], variablesSchema: DashboardVariablesSchema): JsonSchema['properties'] => {
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
    projectId?: string,
): JsonSchema['properties'] | undefined => {
    const _referenceType = propertyName.replace('filters.', '');
    const _isProjectDashboard = projectId && _referenceType === REFERENCE_TYPE_INFO.project.type;
    if (isInherit) { // inherit case
        const refinedPropertySchema = refineOptionSchemaByVariablesSchema(propertySchema, variablesSchema);
        if (_isProjectDashboard) {
            return {
                ...refinedPropertySchema,
                disabled: true,
                default: REFERENCE_TYPE_INFO.project.type,
            };
        } if (variablesSchema.properties[_referenceType]?.use) {
            return refineOptionSchemaByVariablesSchema(propertySchema, variablesSchema);
        }
    } else { // non inherit case
        return refineOptionSchema(propertyName, propertySchema, referenceStoreState);
    }
    return undefined;
};
export const getRefinedWidgetOptionsSchema = (
    referenceStoreState: ReferenceStoreState,
    widgetOptionsSchema: WidgetOptionsSchema,
    variablesSchema: DashboardVariablesSchema,
    inheritOptions: InheritOptions,
    schemaProperties: string[],
    projectId?: string,
): WidgetOptionsSchema['schema'] => {
    const schema = widgetOptionsSchema?.schema;

    const refinedJsonSchema: WidgetOptionsSchema['schema'] = {
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
            refinedJsonSchema.properties[propertyName] = refinedWidgetOptionsSchema;
            refinedJsonSchema.required?.push(propertyName);
        }
    });

    return refinedJsonSchema;
};
export const getRefinedWidgetInheritOptions = (widgetInfo: DashboardLayoutWidgetInfo, projectId?: string): InheritOptions => {
    let inheritOptions = widgetInfo.inherit_options ?? {};
    if (projectId) {
        inheritOptions = {
            ...inheritOptions,
            [`filters.${REFERENCE_TYPE_INFO.project.type}`]: {
                enabled: true,
            },
        };
    }
    return inheritOptions;
};
