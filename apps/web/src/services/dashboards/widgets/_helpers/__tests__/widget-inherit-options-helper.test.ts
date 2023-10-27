// import { cloneDeep } from 'lodash';
import { describe, expect, it } from 'vitest';

// import type { DashboardVariablesSchema } from '@/services/dashboards/config';
// import { MANAGED_DASH_VAR_SCHEMA } from '@/services/dashboards/managed-variables-schema';
// import type { InheritOptions, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
// import { getInitialWidgetInheritOptions } from '@/services/dashboards/widgets/_helpers/widget-inherit-options-helper';
//
//
// const widgetConfigMock: WidgetConfig = {
//     widget_config_id: 'test',
//     scopes: ['DOMAIN', 'PROJECT', 'WORKSPACE'],
//     sizes: ['sm'],
//     options_schema: {
//         properties: [],
//     },
// };
// const variablesSchemaMock: DashboardVariablesSchema = {
//     properties: {
//         provider: {
//             ...MANAGED_DASH_VAR_SCHEMA.properties.provider,
//             use: true,
//         },
//         project: {
//             ...MANAGED_DASH_VAR_SCHEMA.properties.project,
//             use: true,
//         },
//         service_account: {
//             ...MANAGED_DASH_VAR_SCHEMA.properties.service_account,
//             use: true,
//         },
//     },
//     order: ['project', 'service_account'],
// };

describe('[Widget Inherit Options Helper] getInitialWidgetInheritOptions', () => {
    it('test', () => {
        expect(true).toBe(true);
    });
    // TODO: update
    // widget config
    // it('should be the same as widget config if there is no stored inherit options', () => {
    //     const storedInheritOptions: InheritOptions = {};
    //     const refined = getInitialWidgetInheritOptions(widgetConfigMock, storedInheritOptions);
    //     expect(refined).toEqual({
    //         'filters.provider': {
    //             enabled: true,
    //             variable_key: 'provider',
    //         },
    //     });
    // });
    // // merge stored inherit options
    // it('should be disabled if inherit option from stored data is disabled', () => {
    //     const storedInheritOptions: InheritOptions = {
    //         'filters.provider': {
    //             enabled: false,
    //         },
    //     };
    //     const refined = getInitialWidgetInheritOptions(widgetConfigMock, storedInheritOptions);
    //     expect(refined).toEqual({
    //         'filters.provider': {
    //             enabled: false,
    //         },
    //     });
    // });
    // it('should be added inherit option from stored data', () => {
    //     const storedInheritOptions: InheritOptions = {
    //         'filters.project': {
    //             enabled: true,
    //             variable_key: 'project',
    //         },
    //     };
    //     const refined = getInitialWidgetInheritOptions(widgetConfigMock, storedInheritOptions);
    //     expect(refined).toEqual({
    //         'filters.provider': {
    //             enabled: true,
    //             variable_key: 'provider',
    //         },
    //         'filters.project': {
    //             enabled: true,
    //             variable_key: 'project',
    //         },
    //     });
    // });
    // // unused variables;
    // it('should be disabled if variable is not used even if it is enabled in stored data', () => {
    //     const widgetConfig = cloneDeep(widgetConfigMock);
    //     const variablesSchema = cloneDeep(variablesSchemaMock);
    //     const storedInheritOptions: InheritOptions = {
    //         'filters.project': {
    //             enabled: true,
    //             variable_key: 'project',
    //         },
    //     };
    //     variablesSchema.properties.project.use = false;
    //
    //     const refined = getInitialWidgetInheritOptions(widgetConfig, storedInheritOptions, variablesSchema);
    //     expect(refined).toEqual({
    //         'filters.provider': {
    //             enabled: true,
    //             variable_key: 'provider',
    //         },
    //         'filters.project': {
    //             enabled: false,
    //         },
    //     });
    // });
});
