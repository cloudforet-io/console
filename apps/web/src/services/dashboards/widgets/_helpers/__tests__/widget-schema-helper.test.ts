import { describe, expect, it } from 'vitest';

import type { DashboardVariableSchemaProperty } from '@/schema/dashboard/_types/dashboard-type';
import type { WidgetConfig, WidgetOptions } from '@/schema/dashboard/_types/widget-type';

import {
    getInitialSchemaProperties,
    getRefinedSchemaProperties,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const DEFAULT_WIDGET_CONFIG = {
    widget_config_id: 'test',
    scopes: ['DOMAIN', 'PROJECT', 'WORKSPACE'],
    sizes: ['sm'],
} as WidgetConfig;
const DEFAULT_VARIABLE_PROPERTY = {
    name: 'Test',
    variable_type: 'MANAGED',
    selection_type: 'SINGLE',
} as DashboardVariableSchemaProperty;

describe('[Widget Schema Helper] getInitialSchemaProperties', () => {
    // used variables
    it('should include used variables only', () => {
        const widgetConfig = {
            ...DEFAULT_WIDGET_CONFIG,
            options_schema: {
                properties: {
                    'filters.provider': {
                        key: 'provider',
                    },
                    'filters.service_account': {
                        key: 'service_account',
                    },
                    'filters.region': {
                        key: 'region',
                    },
                },
                order: [],
            },
        };
        const variablesSchema = {
            properties: {
                provider: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                service_account: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                region: { ...DEFAULT_VARIABLE_PROPERTY, use: false },
            },
            order: [],
        };
        const refined = getInitialSchemaProperties(widgetConfig, variablesSchema);
        expect(refined).toEqual(expect.arrayContaining(['filters.provider', 'filters.service_account']));
        expect(refined).not.toEqual(expect.arrayContaining(['filters.region']));
    });
    it('should not include properties if it is not in widget config schema properties even if it is used variable', () => {
        const widgetConfig = {
            ...DEFAULT_WIDGET_CONFIG,
            options_schema: {
                properties: {
                    'filters.provider': {
                        key: 'provider',
                    },
                },
                order: [],
            },
        };
        const variablesSchema = {
            properties: {
                provider: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                service_account: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
            },
            order: [],
        };

        const refined = getInitialSchemaProperties(widgetConfig, variablesSchema);
        expect(refined).not.toEqual(expect.arrayContaining(['filters.service_account']));
    });
    // fixed properties
    it('should include fixed properties even if it is not used variables schema', () => {
        const widgetConfig = {
            ...DEFAULT_WIDGET_CONFIG,
            options_schema: {
                properties: {
                    'filters.provider': {
                        key: 'provider',
                        fixed: true,
                    },
                },
                order: [],
            },
        };
        const variablesSchema = {
            properties: {
                provider: { ...DEFAULT_VARIABLE_PROPERTY, use: false },
            },
            order: [],
        };
        const refined = getInitialSchemaProperties(widgetConfig, variablesSchema);
        expect(refined).toEqual(expect.arrayContaining(['filters.provider']));
    });
    // // ordering
    it('should be ordered by order if there is no fixed property', () => {
        const widgetConfig = {
            ...DEFAULT_WIDGET_CONFIG,
            options_schema: {
                properties: {
                    'filters.provider': {
                        key: 'provider',
                    },
                    'filters.service_account': {
                        key: 'service_account',
                    },
                    'filters.region': {
                        key: 'region',
                    },
                },
                order: ['filters.service_account', 'filters.provider', 'filters.region'],
            },
        };
        const variablesSchema = {
            properties: {
                provider: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                service_account: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                region: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
            },
            order: [],
        };
        const refined = getInitialSchemaProperties(widgetConfig, variablesSchema);
        expect(refined).toEqual(['filters.service_account', 'filters.provider', 'filters.region']);
    });
    it('should be ordered by schema.order but fixed properties have higher priority', () => {
        const widgetConfig = {
            ...DEFAULT_WIDGET_CONFIG,
            options_schema: {
                properties: {
                    'filters.provider': {
                        key: 'provider',
                    },
                    'filters.service_account': {
                        key: 'service_account',
                    },
                    'filters.region': {
                        key: 'region',
                        fixed: true,
                    },
                },
                order: ['filters.service_account', 'filters.provider', 'filters.region'],
            },
        };
        const variablesSchema = {
            properties: {
                provider: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                service_account: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                region: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
            },
            order: [],
        };
        const refined = getInitialSchemaProperties(widgetConfig, variablesSchema);
        expect(refined).toEqual(['filters.region', 'filters.service_account', 'filters.provider']);
    });
});


describe('[Widget Schema Helper] getRefinedSchemaProperties', () => {
    it('should be the same as initial schema properties if stored properties are empty', () => {
        const initialProperties = ['filters.provider', 'filters.project', 'filters.service_account'];
        const storedProperties = [];
        const widgetOptions = {};
        const refined = getRefinedSchemaProperties(storedProperties, initialProperties, widgetOptions);
        expect(refined).toEqual(['filters.provider', 'filters.project', 'filters.service_account']);
    });
    it('should be not exist if the value is not set in widget options and it is not in initial schema properties even if it is in stored properties', () => {
        const initialProperties = ['filters.project', 'filters.service_account'];
        const storedProperties = ['filters.provider'];
        const widgetOptions = {};
        const refined = getRefinedSchemaProperties(storedProperties, initialProperties, widgetOptions);
        expect(refined).toEqual(['filters.project', 'filters.service_account']);
    });
    it('should be exist if the value is set in widget options, stored properties even if it is not in initial schema properties.', () => {
        const initialProperties = ['filters.project', 'filters.service_account'];
        const storedProperties = ['filters.provider'];
        const widgetOptions: WidgetOptions = {
            filters: {
                provider: [{ k: 'provider', v: 'aws' }],
            },
        };
        const refined = getRefinedSchemaProperties(storedProperties, initialProperties, widgetOptions);
        expect(refined).toEqual(['filters.project', 'filters.service_account', 'filters.provider']);
    });
});
