import { describe, expect, it } from 'vitest';

import type { DashboardVariableSchemaProperty, DashboardVariablesSchema } from '@/api-clients/dashboard/_types/dashboard-type';
import type { InheritOptions, WidgetConfig, WidgetOptions } from '@/api-clients/dashboard/_types/widget-type';

import {
    getInitialSchemaProperties, getNonInheritedWidgetOptionNamesAmongUsedVariables,
    getRefinedSchemaProperties, getWidgetOptionKeyByVariableKey,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-schema-helper';

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

describe('[Widget Schema Helper]', () => {
    describe('getWidgetOptionKeyByVariableKey', () => {
        it('should return option key if variable key is in widget options schema properties', () => {
            const optionKey = getWidgetOptionKeyByVariableKey('provider');
            expect(optionKey).toEqual('filters.provider');
        });
        it('should return undefined if variable key is not in widget options schema properties', () => {
            const optionKey = getWidgetOptionKeyByVariableKey('not-exist');
            expect(optionKey).toBeUndefined();
        });
    });
    describe('getNonInheritedWidgetOptionsAmongUsedVariables', () => {
        it('should include used variables only', () => {
            const variablesSchema: DashboardVariablesSchema = {
                properties: {
                    provider: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                    service_account: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                    region: { ...DEFAULT_VARIABLE_PROPERTY, use: false },
                },
                order: [],
            };
            const inheritOptions: InheritOptions = {};
            const schemaProperties = ['filters.provider', 'filters.service_account'];
            const refined = getNonInheritedWidgetOptionNamesAmongUsedVariables(variablesSchema, inheritOptions, schemaProperties);
            expect(refined).toEqual(expect.arrayContaining(['Provider', 'Service Account']));
            expect(refined).not.toEqual(expect.arrayContaining(['Region']));
        });
        it('should NOT include property which is NOT inheritable even if it is used variable', () => {
            const variablesSchema: DashboardVariablesSchema = {
                properties: {
                    provider: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                    service_account: { ...DEFAULT_VARIABLE_PROPERTY, use: true },
                    region: { ...DEFAULT_VARIABLE_PROPERTY, use: false },
                },
                order: [],
            };
            const inheritOptions: InheritOptions = {
                'filters.provider': {
                    enabled: false,
                },
            };
            const schemaProperties = ['filters.provider', 'filters.service_account'];
            const refined = getNonInheritedWidgetOptionNamesAmongUsedVariables(variablesSchema, inheritOptions, schemaProperties);
            expect(refined).toEqual(expect.arrayContaining(['Provider']));
            expect(refined).not.toEqual(expect.arrayContaining(['Service Account', 'Region']));
        });
    });

    describe('getInitialSchemaProperties', () => {
    // used variables
        it('should include fixed variables only', () => {
            const widgetConfig: WidgetConfig = {
                ...DEFAULT_WIDGET_CONFIG,
                options_schema: {
                    properties: {
                        'filters.provider': {
                            key: 'provider',
                            fixed: true,
                        },
                        'filters.service_account': {
                            key: 'service_account',
                            fixed: true,
                        },
                        'filters.region': {
                            key: 'region',
                            fixed: false,
                        },
                    },
                    order: [],
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
                            fixed: true,
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
            expect(refined).toEqual(expect.arrayContaining(['filters.provider']));
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
        it('should be ordered by order if there is no fixed dashboard variable', () => {
            const widgetConfig = {
                ...DEFAULT_WIDGET_CONFIG,
                options_schema: {
                    properties: {
                        'filters.provider': {
                            key: 'provider',
                            fixed: true,
                        },
                        'filters.service_account': {
                            key: 'service_account',
                            fixed: true,
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
            expect(refined).toEqual(['filters.region']);
        });
    });


    describe('getRefinedSchemaProperties', () => {
        it('should include a property which is in both initial schema properties and stored properties', () => {
            const initialProperties = ['filters.provider', 'filters.project', 'filters.service_account'];
            const storedProperties = ['filters.provider', 'filters.project', 'filters.service_account'];
            const refined = getRefinedSchemaProperties(storedProperties, initialProperties);
            expect(refined).toEqual(['filters.provider', 'filters.project', 'filters.service_account']);
        });
        it('should include a property which is in NOT in initial properties but in stored properties, and it is in widget options', () => {
            const initialProperties = [];
            const storedProperties = ['filters.provider'];
            const widgetOptions: WidgetOptions = {
                filters: {
                    provider: [{ k: 'provider', v: 'aws' }],
                },
            };
            const refined = getRefinedSchemaProperties(storedProperties, initialProperties, widgetOptions);
            expect(refined).toEqual(['filters.provider']);
        });
        it('should NOT include a property which is in NOT in initial properties but in stored properties, and it is NOT in widget options', () => {
            const initialProperties = [];
            const storedProperties = ['filters.provider'];
            const widgetOptions: WidgetOptions = {};
            const refined = getRefinedSchemaProperties(storedProperties, initialProperties, widgetOptions);
            expect(refined).toEqual([]);
        });
        it('should include a property which is in initial properties but NOT in stored properties, and it is enabled inherit option', () => {
            const initialProperties = ['filters.provider'];
            const storedProperties = [];
            const inheritOptions: InheritOptions = {
                'filters.provider': {
                    enabled: true,
                },
            };
            const refined = getRefinedSchemaProperties(storedProperties, initialProperties, undefined, inheritOptions);
            expect(refined).toEqual(['filters.provider']);
        });
        it('should NOT include a property which is in initial properties but NOT in stored properties, and it is NOT enabled inherit option', () => {
            const initialProperties = ['filters.provider'];
            const storedProperties = [];
            const inheritOptions: InheritOptions = {
                'filters.provider': {
                    enabled: false,
                },
            };
            const refined = getRefinedSchemaProperties(storedProperties, initialProperties, undefined, inheritOptions);
            expect(refined).toEqual([]);
        });
        it('should NOT include a property which is not in both initial properties and stored properties', () => {
            const initialProperties = ['filters.provider'];
            const storedProperties = ['filters.project'];
            const refined = getRefinedSchemaProperties(storedProperties, initialProperties);
            expect(refined).toEqual([]);
        });
    });
});
