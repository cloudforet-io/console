import { cloneDeep } from 'lodash';
import { describe, expect, it } from 'vitest';

import type { DashboardVariablesSchema } from '@/api-clients/dashboard/_types/dashboard-type';
import type { InheritOptions, WidgetConfig, WidgetOptionsSchema } from '@/api-clients/dashboard/_types/widget-type';

import {
    getInheritingOptionKeys,
    getInitialWidgetInheritOptions,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-inherit-options-helper';



const widgetConfigMock: WidgetConfig = {
    widget_config_id: 'test',
    scopes: ['DOMAIN', 'PROJECT', 'WORKSPACE'],
    sizes: ['sm'],
    options: {},
    options_schema: {
        properties: {
            'filters.region': {
                key: 'region',
                name: 'Region',
                selection_type: 'MULTI',
                inheritance_mode: 'KEY_MATCHING',
            },
        },
        order: ['filters.region'],
    },
};
const storedInheritOptionsMock: InheritOptions = {
    'filters.region': {
        enabled: true,
        variable_key: 'region',
    },
};
const variablesSchemaMock: DashboardVariablesSchema = {
    properties: {
        region: {
            name: 'Region',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
        },
        provider: {
            name: 'Provider',
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
        },
    },
    order: ['region'],
};

describe('[Widget Inherit Options Helper] getInitialWidgetInheritOptions', () => {
    it('should return empty object if there is no property in widget config even if stored inherit options exist and enabled', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        (widgetConfig.options_schema as WidgetOptionsSchema).properties = {};
        const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptionsMock, variablesSchemaMock);
        expect(refined).toEqual({});
    });
    it('should not include property if inheritance mode is NONE regardless of variable availability', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'NONE';
        const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptionsMock, variablesSchemaMock);
        expect(refined).not.toHaveProperty('filters.region');
    });
    // inheritance_mode is KEY_MATCHING
    it('should include property with enabled true if inheritance mode is KEY_MATCHING and variable is available if it is undefined in stored inherit option', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'KEY_MATCHING';
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].key = 'region';
        const variablesSchema = cloneDeep(variablesSchemaMock);
        variablesSchema.properties.region.use = true;
        const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
        delete storedInheritOptions['filters.region']; // delete property from inherit options
        const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
        expect(refined).toHaveProperty('filters.region');
        expect(refined['filters.region']).toEqual({
            enabled: true,
            variable_key: 'region',
        });
    });
    it('should include property with enabled false if it is disabled in stored inherit options', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'KEY_MATCHING';
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].key = 'region';
        const variablesSchema = cloneDeep(variablesSchemaMock);
        variablesSchema.properties.region.use = true;
        const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
        storedInheritOptions['filters.region'] = { enabled: false }; // set false
        const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
        expect(refined).toHaveProperty('filters.region');
        expect(refined['filters.region']).toEqual({
            enabled: false,
        });
    });
    it('should NOT include property if inheritance mode is KEY_MATCHING and variable is unavailable regardless of stored inherit options', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'KEY_MATCHING';
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].key = 'region';
        const variablesSchema = cloneDeep(variablesSchemaMock);
        variablesSchema.properties.region.use = false;
        const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
        storedInheritOptions['filters.region'] = { ...storedInheritOptions['filters.region'], enabled: true };
        const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
        expect(refined).not.toHaveProperty('filters.region');
    });
    // inheritance_mode is undefined means KEY_MATCHING
    it('should include property if inheritance mode is undefined and variable is available if it is undefined in stored inherit option', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = undefined;
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].key = 'region';
        const variablesSchema = cloneDeep(variablesSchemaMock);
        variablesSchema.properties.region.use = true;
        const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
        delete storedInheritOptions['filters.region']; // delete property from inherit options
        const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
        expect(refined).toHaveProperty('filters.region');
        expect(refined['filters.region']).toEqual({
            enabled: true,
            variable_key: 'region',
        });
    });
    it('should NOT include property if inheritance mode is undefined and variable is unavailable regardless of stored inherit options', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = undefined;
        (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].key = 'region';
        const variablesSchema = cloneDeep(variablesSchemaMock);
        variablesSchema.properties.region.use = false;
        const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
        storedInheritOptions['filters.region'] = { ...storedInheritOptions['filters.region'], enabled: true };
        const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
        expect(refined).not.toHaveProperty('filters.region');
    });
    // inheritance_mode is SELECTION_TYPE_MATCHING
    describe('when inheritance_mode is SELECTION_TYPE_MATCHING, ', () => {
        describe('and when the property in stored inherit options is enabled, the property', () => {
            it('should have enabled with true and the variable_key must be same with stored inherit options if the variable is available', () => {
                const widgetConfig = cloneDeep(widgetConfigMock);
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'SELECTION_TYPE_MATCHING';
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].selection_type = 'MULTI';
                const variablesSchema = cloneDeep(variablesSchemaMock);
                variablesSchema.properties.region.use = true; // make variable available
                const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
                storedInheritOptions['filters.region'] = { variable_key: 'region', enabled: true };
                const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
                expect(refined).toHaveProperty('filters.region');
                expect(refined['filters.region']).toEqual({
                    enabled: true,
                    variable_key: 'region',
                });
            });
            it('should have enabled with true and the variable_key must be automatically found by selection_type if that in stored inherit options is unavailable', () => {
                const widgetConfig = cloneDeep(widgetConfigMock);
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'SELECTION_TYPE_MATCHING';
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].selection_type = 'MULTI';
                const variablesSchema = cloneDeep(variablesSchemaMock);
                variablesSchema.properties.region.use = false; // make variable unavailable
                variablesSchema.properties.region.selection_type = 'MULTI';
                variablesSchema.properties.provider.use = true; // make other variable available
                variablesSchema.properties.provider.selection_type = 'MULTI';
                const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
                storedInheritOptions['filters.region'] = { variable_key: 'region', enabled: true };
                const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
                expect(refined).toHaveProperty('filters.region');
                expect(refined['filters.region']).toEqual({
                    enabled: true,
                    variable_key: 'provider',
                });
            });
            it('should have enabled with true and the variable_key must be automatically found by selection_type and availability(use) '
                    + 'if there is no variable_key in stored inherit options', () => {
                const widgetConfig = cloneDeep(widgetConfigMock);
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'SELECTION_TYPE_MATCHING';
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].selection_type = 'MULTI';
                const variablesSchema = cloneDeep(variablesSchemaMock);
                variablesSchema.properties.region.use = true; // make variable available
                variablesSchema.properties.region.selection_type = 'MULTI';
                const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
                storedInheritOptions['filters.region'] = { variable_key: undefined, enabled: true };
                const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
                expect(refined).toHaveProperty('filters.region');
                expect(refined['filters.region']).toEqual({
                    enabled: true,
                    variable_key: 'region',
                });
            });
            it('should NOT be defined if the variable_key in stored inherit options is unavailable and there is no matching available variable by selection_type', () => {
                const widgetConfig = cloneDeep(widgetConfigMock);
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'SELECTION_TYPE_MATCHING';
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].selection_type = 'MULTI';
                const variablesSchema = cloneDeep(variablesSchemaMock);
                variablesSchema.properties.region.use = false; // make variable unavailable
                variablesSchema.properties.region.selection_type = 'MULTI'; // make selection_type the same
                variablesSchema.properties.provider.use = true; // make variable available
                variablesSchema.properties.provider.selection_type = 'SINGLE'; // make selection_type different
                const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
                storedInheritOptions['filters.region'] = { variable_key: 'region', enabled: true };
                const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
                expect(refined).not.toHaveProperty('filters.region');
            });
            it('should NOT be defined if the variable_key is undefined and there is no matching available variable by selection_type', () => {
                const widgetConfig = cloneDeep(widgetConfigMock);
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'SELECTION_TYPE_MATCHING';
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].selection_type = 'MULTI';
                const variablesSchema = cloneDeep(variablesSchemaMock);
                variablesSchema.properties.region.use = false; // make variable unavailable
                variablesSchema.properties.region.selection_type = 'MULTI'; // make selection_type the same
                variablesSchema.properties.provider.use = true; // make variable available
                variablesSchema.properties.provider.selection_type = 'SINGLE'; // make selection_type different
                const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
                storedInheritOptions['filters.region'] = { variable_key: undefined, enabled: true };
                const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
                expect(refined).not.toHaveProperty('filters.region');
                expect(refined).not.toHaveProperty('filters.provider');
            });
        });
        describe('and when the property in stored inherit options is NOT enabled, the property', () => {
            // should include property with enabled true regardless if it is undefined in stored inherit option
            it('should NOT be defined regardless of variable availability and selection_type matching', () => {
                const widgetConfig = cloneDeep(widgetConfigMock);
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].inheritance_mode = 'SELECTION_TYPE_MATCHING';
                (widgetConfig.options_schema as WidgetOptionsSchema).properties['filters.region'].selection_type = 'MULTI';
                const variablesSchema = cloneDeep(variablesSchemaMock);
                variablesSchema.properties.region.use = true; // make variable available
                variablesSchema.properties.region.selection_type = 'MULTI'; // make selection_type the same
                const storedInheritOptions = cloneDeep(storedInheritOptionsMock);
                delete storedInheritOptions['filters.region'];
                const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
                expect(refined).not.toHaveProperty('filters.region');
            });
        });
    });
});

describe('[Widget Inherit Options Helper] getInheritingProperties', () => {
    it('should return empty array if there is no property in inheritOptions', () => {
        const inheritOptions: InheritOptions = {};
        const properties = getInheritingOptionKeys('filters.region', inheritOptions);
        expect(properties).toEqual([]);
    });
    it('should return empty array if there is no property in inheritOptions whose enabled is true', () => {
        const inheritOptions: InheritOptions = {
            'filters.region': {
                enabled: false,
                variable_key: 'region',
            },
        };
        const properties = getInheritingOptionKeys('region', inheritOptions);
        expect(properties).toEqual([]);
    });
    it('should return empty array if there is no property in inheritOptions whose variable_key is same with given variableKey', () => {
        const inheritOptions: InheritOptions = {
            'filters.region': {
                enabled: true,
                variable_key: 'region',
            },
        };
        const properties = getInheritingOptionKeys('provider', inheritOptions);
        expect(properties).toEqual([]);
    });
    it('should return array of property names if there are properties in inheritOptions whose enabled is true and variable_key is same with given variableKey', () => {
        const inheritOptions: InheritOptions = {
            'filters.region': {
                enabled: true,
                variable_key: 'region',
            },
            'filters.provider': {
                enabled: true,
                variable_key: 'provider',
            },
        };
        const properties = getInheritingOptionKeys('region', inheritOptions);
        expect(properties).toEqual(['filters.region']);
    });
});


