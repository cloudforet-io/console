import { cloneDeep } from 'lodash';
import { describe, expect, it } from 'vitest';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { managedDashboardVariablesSchema } from '@/services/dashboards/managed-variables-schema';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import {
    getInitialSchemaProperties,
    getWidgetFilterOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


const widgetConfigMock: WidgetConfig = {
    widget_config_id: 'test',
    scopes: ['DOMAIN', 'PROJECT', 'WORKSPACE'],
    sizes: ['sm'],
    options_schema: {
        fixed_properties: ['filters.provider'],
        schema: {
            type: 'object',
            properties: {
                'filters.provider': getWidgetFilterOptionsSchema('provider'),
                'filters.project': getWidgetFilterOptionsSchema('project'),
                'filters.service_account': getWidgetFilterOptionsSchema('service_account'),
                'filters.region': getWidgetFilterOptionsSchema('region'),
                'filters.cost_product': getWidgetFilterOptionsSchema('cost_product'),
            },
            order: ['filters.project', 'filters.cost_product', 'filters.service_account', 'filters.region'],
        },
    },
};
const variablesSchemaMock: DashboardVariablesSchema = {
    properties: {
        project: {
            ...managedDashboardVariablesSchema.properties.project,
            use: true,
        },
        service_account: {
            ...managedDashboardVariablesSchema.properties.service_account,
            use: true,
        },
    },
    order: ['project', 'service_account'],
};

describe('[Widget Schema Helper] getInitialSchemaProperties', () => {
    // used variables
    it('should include used variables', () => {
        const refined = getInitialSchemaProperties(widgetConfigMock, variablesSchemaMock);
        expect(refined).toEqual(expect.arrayContaining(['filters.project', 'filters.service_account']));
    });
    it('should not include unused variables', () => {
        const refined = getInitialSchemaProperties(widgetConfigMock, variablesSchemaMock);
        expect(refined).not.toEqual(expect.arrayContaining(['filters.cost_product', 'filters.region']));
    });
    it('should not include used variables if it is not in schema', () => {
        const variablesSchema = cloneDeep(variablesSchemaMock);
        variablesSchema.properties.abc = { ...managedDashboardVariablesSchema.properties.project, use: true };

        const refined = getInitialSchemaProperties(widgetConfigMock, variablesSchema);
        expect(refined).not.toEqual(expect.arrayContaining(['filters.abc']));
    });
    // fixed properties
    it('should include fixed properties', () => {
        const refined = getInitialSchemaProperties(widgetConfigMock, variablesSchemaMock);
        expect(refined).toEqual(expect.arrayContaining(['filters.provider']));
    });
    // ordering
    it('should be ordered by schema.order', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        if (widgetConfig.options_schema) widgetConfig.options_schema.fixed_properties = undefined;

        const refined = getInitialSchemaProperties(widgetConfig, variablesSchemaMock);
        expect(refined).toEqual(['filters.project', 'filters.service_account']);
    });
    it('should be ordered by schema.order and fixed properties', () => {
        const refined = getInitialSchemaProperties(widgetConfigMock, variablesSchemaMock);
        expect(refined).toEqual(['filters.provider', 'filters.project', 'filters.service_account']);
    });
});
