import { cloneDeep } from 'lodash';
import { describe, expect, it } from 'vitest';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { managedDashboardVariablesSchema } from '@/services/dashboards/managed-variables-schema';
import type { InheritOptions, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { getInitialWidgetInheritOptions } from '@/services/dashboards/widgets/_helpers/widget-inherit-options-helper';


const widgetConfigMock: WidgetConfig = {
    widget_config_id: 'test',
    scopes: ['DOMAIN', 'PROJECT', 'WORKSPACE'],
    sizes: ['sm'],
    inherit_options: {
        'filters.provider': {
            enabled: true,
            variable_info: {
                key: 'provider',
            },
        },
    },
    options_schema: {
        non_inheritable_properties: ['cost_group_by'],
        schema: {
        },
    },
};
const variablesSchemaMock: DashboardVariablesSchema = {
    properties: {
        provider: {
            ...managedDashboardVariablesSchema.properties.provider,
            use: true,
        },
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

describe('[Widget Inherit Options Helper] getInitialWidgetInheritOptions', () => {
    // widget config
    it('should be the same as widget config if there is no stored inherit options', () => {
        const storedInheritOptions: InheritOptions = {};
        const refined = getInitialWidgetInheritOptions(widgetConfigMock, storedInheritOptions);
        expect(refined).toEqual({
            'filters.provider': {
                enabled: true,
                variable_info: {
                    key: 'provider',
                },
            },
        });
    });
    // merge stored inherit options
    it('should be disabled if inherit option from stored data is disabled', () => {
        const storedInheritOptions: InheritOptions = {
            'filters.provider': {
                enabled: false,
            },
        };
        const refined = getInitialWidgetInheritOptions(widgetConfigMock, storedInheritOptions);
        expect(refined).toEqual({
            'filters.provider': {
                enabled: false,
            },
        });
    });
    it('should be added inherit option from stored data', () => {
        const storedInheritOptions: InheritOptions = {
            'filters.project': {
                enabled: true,
                variable_info: {
                    key: 'project',
                },
            },
        };
        const refined = getInitialWidgetInheritOptions(widgetConfigMock, storedInheritOptions);
        expect(refined).toEqual({
            'filters.provider': {
                enabled: true,
                variable_info: {
                    key: 'provider',
                },
            },
            'filters.project': {
                enabled: true,
                variable_info: {
                    key: 'project',
                },
            },
        });
    });
    // unused variables
    it('should be disabled if variable is not used even if it is enabled in widget config', () => {
        const widgetConfig = cloneDeep(widgetConfigMock);
        const variablesSchema = cloneDeep(variablesSchemaMock);
        if (widgetConfig.inherit_options) {
            widgetConfig.inherit_options['filters.project'] = {
                enabled: true,
                variable_info: {
                    key: 'project',
                },
            };
        }
        variablesSchema.properties.project.use = false;
        const storedInheritOptions: InheritOptions = {};

        const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
        expect(refined).toEqual({
            'filters.provider': {
                enabled: true,
                variable_info: {
                    key: 'provider',
                },
            },
            'filters.project': {
                enabled: false,
            },
        });
    });
});
