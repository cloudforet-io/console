import {
    cloneDeep, isEmpty, isEqual,
} from 'lodash';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import type {
    DashboardSettings, DashboardVariables, DashboardVariablesSchema,
    DashboardVariableSchemaProperty,
} from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import { MANAGED_DASH_VAR_SCHEMA } from '@/services/dashboards/managed-variables-schema';
import type { DashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import type {
    DashboardLayoutWidgetInfo,
    InheritOptions,
    UpdatableWidgetInfo,
} from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

interface WidgetValidMap {
    [widgetKey: string]: boolean;
}

export interface DashboardDetailInfoStoreState {
    dashboardInfo: DashboardModel|null;
    loadingDashboard: boolean;
    dashboardId: string | undefined;
    projectId: string;
    name: string;
    placeholder: string;
    settings: DashboardSettings;
    variables: DashboardVariables;
    variablesSchema: DashboardVariablesSchema;
    variablesInitMap: Record<string, boolean>;
    labels: string[];
    // widget info states
    dashboardWidgetInfoList: DashboardLayoutWidgetInfo[];
    loadingWidgets: boolean;
    // validation
    isNameValid?: boolean;
    widgetValidMap: WidgetValidMap;
}
const DEFAULT_REFRESH_INTERVAL = '5m';
export const DASHBOARD_DEFAULT = Object.freeze<{ settings: DashboardSettings }>({
    settings: {
        date_range: {
            start: undefined,
            end: undefined,
            enabled: false,
        },
        refresh_interval_option: DEFAULT_REFRESH_INTERVAL,
    },
});

const refineProjectDashboardVariablesSchema = (variablesSchemaInfo: DashboardVariablesSchema, labels?: string[]): DashboardVariablesSchema => {
    let projectPropertySchema = { ...MANAGED_DASH_VAR_SCHEMA.properties.project, disabled: true };
    if (labels?.includes('Asset')) {
        projectPropertySchema = { ...MANAGED_DASH_VAR_SCHEMA.properties.project, disabled: true };
    }
    const properties = { ...variablesSchemaInfo.properties, project: projectPropertySchema };

    const order = [...variablesSchemaInfo.order];
    const projectIdx = variablesSchemaInfo.order.findIndex((property) => property === 'project');
    if (projectIdx !== -1) order.splice(projectIdx, 1);
    order.splice(0, 0, 'project');

    return {
        properties,
        order,
    };
};
const refineProjectDashboardVariables = (variables: DashboardVariables, projectId: string): DashboardVariables => {
    const _variables = { ...variables };
    _variables.project = [projectId];
    return _variables;
};

export const useDashboardDetailInfoStore = defineStore('dashboard-detail-info', {
    state: (): DashboardDetailInfoStoreState => ({
        dashboardInfo: null as DashboardModel|null,
        loadingDashboard: false,
        dashboardId: '',
        projectId: '',
        name: '',
        placeholder: '',
        settings: DASHBOARD_DEFAULT.settings,
        variables: {},
        variablesSchema: {
            properties: {},
            order: [],
        },
        variablesInitMap: {},
        labels: [],
        // widget info states
        dashboardWidgetInfoList: [],
        loadingWidgets: false,
        // validation
        isNameValid: undefined,
        widgetValidMap: {},
    }),
    getters: {
        isProjectDashboard: (state) => {
            if (state.projectId) return true;
            return !!state.dashboardId?.startsWith('project');
        },
        dashboardViewer: (state) => state.dashboardInfo?.viewers ?? DASHBOARD_VIEWER.PRIVATE,
        isWidgetLayoutValid: (state) => Object.values(state.widgetValidMap).every((d) => d === true),
        isAllVariablesInitialized: (state) => {
            if (!state.dashboardInfo) return false;
            return Object.values(state.variablesInitMap).every((d) => d === true);
        },
    },
    actions: {
        resetDashboardData() {
            this.dashboardInfo = null;
            this.name = '';
            this.placeholder = '';
            this.projectId = '';
            this.settings = DASHBOARD_DEFAULT.settings;
            this.variables = {};
            this.variablesSchema = { properties: {}, order: [] };
            this.variablesInitMap = {};
            this.labels = [];
            //
            this.isNameValid = undefined;
            this.widgetValidMap = {};
        },
        setOriginDashboardName(name: string) {
            if (this.dashboardInfo) this.dashboardInfo.name = name;
        },
        revertDashboardData() {
            if (!this.dashboardInfo) return;
            this.setDashboardInfo(this.dashboardInfo);
        },
        setDashboardInfo(dashboardInfo?: DashboardModel) {
            if (!dashboardInfo || isEmpty(dashboardInfo)) {
                console.error('setDashboardInfo failed', dashboardInfo);
                return;
            }

            this.dashboardInfo = dashboardInfo;

            const _dashboardInfo = cloneDeep(dashboardInfo);
            this.name = _dashboardInfo.name;
            this.projectId = (_dashboardInfo as ProjectDashboardModel).project_id ?? '';
            this.settings = {
                date_range: {
                    enabled: _dashboardInfo.settings?.date_range?.enabled ?? false,
                    start: _dashboardInfo.settings?.date_range?.start,
                    end: _dashboardInfo.settings?.date_range?.end,
                },
                refresh_interval_option: _dashboardInfo.settings?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
            };

            let _variablesSchema = {
                properties: _dashboardInfo.variables_schema?.properties ?? {},
                order: _dashboardInfo.variables_schema?.order ?? [],
            };
            let _variables = _dashboardInfo.variables ?? {};
            if (this.projectId) {
                _variablesSchema = refineProjectDashboardVariablesSchema(_variablesSchema, _dashboardInfo.labels);
                _variables = refineProjectDashboardVariables(_variables, this.projectId);
            }
            const _variablesInitMap = {};
            Object.entries(_variablesSchema.properties).forEach(([propertyName, property]) => {
                if (property.use) _variablesInitMap[propertyName] = false;
            });
            this.variablesSchema = _variablesSchema;
            this.variables = _variables;
            this.variablesInitMap = _variablesInitMap;

            this.labels = _dashboardInfo.labels;
            this.dashboardWidgetInfoList = _dashboardInfo?.layouts?.flat()?.map((info) => ({
                ...info,
                widget_key: info.widget_key ?? uuidv4(),
            })) ?? [];
        },
        async getDashboardInfo(dashboardId: undefined|string, force = false) {
            if (!force && (dashboardId === this.dashboardId || dashboardId === undefined)) return;

            // WARN:: from under this line, beware using originState. originState could reference irrelevant dashboard data
            this.dashboardId = dashboardId;
            this.loadingDashboard = true;
            try {
                let result: DashboardModel;
                if (dashboardId?.startsWith('project')) {
                    result = await SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: this.dashboardId });
                } else {
                    result = await SpaceConnector.clientV2.dashboard.domainDashboard.get({ domain_dashboard_id: this.dashboardId });
                }
                const resultWithConvertedVariableSchema = this.convertDashboardInfo(result);
                this.setDashboardInfo(resultWithConvertedVariableSchema);
            } catch (e) {
                this.resetDashboardData();
                throw e;
            } finally {
                this.loadingDashboard = false;
            }
        },
        toggleWidgetSize(widgetKey: string) {
            const _targetIndex = this.dashboardWidgetInfoList.findIndex((info) => info.widget_key === widgetKey);
            if (_targetIndex > -1) {
                const _dashboardWidgetInfoList = cloneDeep(this.dashboardWidgetInfoList);
                const widgetInfo = _dashboardWidgetInfoList[_targetIndex];
                const widgetSizes = getWidgetConfig(widgetInfo.widget_name)?.sizes;
                _dashboardWidgetInfoList[_targetIndex] = {
                    ...widgetInfo,
                    size: (widgetInfo.size === WIDGET_SIZE.full) ? (widgetSizes[0] ?? WIDGET_SIZE.md) : WIDGET_SIZE.full,
                };
                this.dashboardWidgetInfoList = _dashboardWidgetInfoList;
            }
        },
        updateWidgetInfo(widgetKey: string, data: UpdatableWidgetInfo) {
            const targetIndex = this.dashboardWidgetInfoList.findIndex((info) => info.widget_key === widgetKey);
            if (targetIndex > -1) {
                const _dashboardWidgetInfoList = cloneDeep(this.dashboardWidgetInfoList);
                _dashboardWidgetInfoList[targetIndex] = {
                    ...this.dashboardWidgetInfoList[targetIndex],
                    title: data.title,
                    inherit_options: data.inherit_options,
                    widget_options: data.widget_options,
                    schema_properties: data.schema_properties,
                };
                this.dashboardWidgetInfoList = _dashboardWidgetInfoList;
            }
        },
        deleteWidget(widgetKey: string) {
            this.dashboardWidgetInfoList = this.dashboardWidgetInfoList.filter((info) => info.widget_key !== widgetKey);
            const _widgetValidMap = { ...this.widgetValidMap };
            delete _widgetValidMap[widgetKey];
            this.widgetValidMap = _widgetValidMap;
        },
        resetVariables(originVariables?: DashboardVariables, originVariablesSchema?: DashboardVariablesSchema) {
            const _originVariables: DashboardVariables = originVariables ?? this.dashboardInfo?.variables ?? {};
            const _originVariablesSchema: DashboardVariablesSchema = originVariablesSchema ?? this.dashboardInfo?.variables_schema ?? { properties: {}, order: [] };

            // reset variables schema
            let _variableSchema = cloneDeep(this.variablesSchema);
            this.variablesSchema.order.forEach((property) => {
                if (!_originVariablesSchema?.properties[property]) return;
                _variableSchema.properties[property].use = _originVariablesSchema?.properties[property].use;
            });

            if (this.projectId) _variableSchema = refineProjectDashboardVariablesSchema(_variableSchema);
            this.variablesSchema = _variableSchema;

            // reset variables and variables init map
            let _variables = cloneDeep(this.variables);
            const _variablesInitMap = {};
            _originVariablesSchema.order.forEach((property) => {
                // CASE: existing variable is deleted.
                if (!this.variablesSchema.properties[property]) return;
                if (isEqual(this.variablesSchema.properties[property], _originVariablesSchema?.properties[property])) {
                    _variables[property] = _originVariables[property];
                    _variablesInitMap[property] = true;
                } else {
                    _variablesInitMap[property] = false;
                }
            });
            if (this.projectId) _variables = refineProjectDashboardVariables(_variables, this.projectId);
            this.variables = _variables;
            this.variablesInitMap = _variablesInitMap;
        },
        updateWidgetValidation(isValid: boolean, widgetKey: string) {
            this.widgetValidMap[widgetKey] = isValid;
        },
        // This action is for handling dashboard data that does not reflect schema changes.
        convertDashboardInfo(dashboardInfo: DashboardModel): DashboardModel {
            // NOTE: This is for conversion from old dashboard variable schema to new one which is stored to database before version 2.0(<=1.12).
            const convertedVariablesSchema = getConvertedVariablesSchema(dashboardInfo.variables_schema);
            // NOTE: This is for conversion from old widget info spec to new one which is stored to database before version 2.0(<=1.12).
            const convertedWidgetLayouts = getConvertedWidgetLayouts(dashboardInfo.layouts);
            return {
                ...dashboardInfo,
                variables_schema: convertedVariablesSchema,
                layouts: convertedWidgetLayouts,
            };
        },
    },
});

const getConvertedWidgetLayouts = (storedWidgetLayouts: DashboardModel['layouts']): DashboardModel['layouts'] => {
    if (!storedWidgetLayouts?.length) return storedWidgetLayouts;

    return storedWidgetLayouts.map((layout) => layout.map((widgetInfo) => {
        const convertedInheritOptions = getConvertedWidgetInheritOptions(widgetInfo.inherit_options);
        return {
            ...widgetInfo,
            inherit_options: convertedInheritOptions,
        };
    }));
};
const getConvertedWidgetInheritOptions = (storedInheritOptions?: InheritOptions|DeprecatedInheritOptions): InheritOptions|undefined => {
    if (isEmpty(storedInheritOptions)) return storedInheritOptions;

    const inheritOptions = cloneDeep(storedInheritOptions);
    Object.entries(inheritOptions).forEach(([k, inheritOption]) => {
        const variableKey = inheritOption.variable_info?.key;
        if (variableKey) {
            inheritOptions[k] = {
                enabled: inheritOptions[k].enabled,
                variable_key: variableKey,
            };
            delete (inheritOptions[k] as DeprecatedInheritOptions).variable_info;
        }
    });
    return inheritOptions;
};
type DeprecatedInheritOptions = Record<string, {
    enabled?: boolean;
    variable_info?: {
        key: string;
    },
}>;

const getConvertedVariablesSchema = (storedVariablesSchema: DashboardVariablesSchema): DashboardVariablesSchema => {
    if (isEmpty(storedVariablesSchema)) return storedVariablesSchema;

    const variablesSchema = cloneDeep(storedVariablesSchema);
    Object.entries(variablesSchema.properties).forEach(([k, property]) => {
        if (property.variable_type === 'MANAGED') {
            if (MANAGED_DASH_VAR_SCHEMA.properties[k]) {
                variablesSchema.properties[k] = {
                    ...MANAGED_DASH_VAR_SCHEMA.properties[k],
                    use: property.use,
                };
            } else if (k === 'asset_query_set') {
                variablesSchema.properties[MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key] = {
                    ...MANAGED_DASH_VAR_SCHEMA.properties[MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_query_set.key],
                    use: property.use,
                };
                delete variablesSchema.properties[k];
            } else {
                console.error(new Error(`conversion failed: ${property}`));
            }
        } else {
            const options = getConvertedCustomOptions(property.options);
            variablesSchema.properties[k] = {
                ...property, options,
            };
        }
    });
    return variablesSchema;
};
const getConvertedCustomOptions = (storedOptions?: DeprecatedCustomVariableOptions|DashboardVariableSchemaProperty['options']): DashboardVariableSchemaProperty['options']|undefined => {
    // early return if storedOptions is empty or already in the new format.
    if (!storedOptions || Array.isArray(storedOptions)) return storedOptions;

    const options = storedOptions as DeprecatedCustomVariableOptions;

    // only ENUM type was supported for custom options in old dashboard variable schema.
    if (options.type === 'ENUM') {
        if (options.values[0]?.label) {
            return [{
                type: 'ENUM',
                values: options.values.map((value) => ({ key: value.key, name: value.label })),
            }];
        }
    }

    console.error('getConvertedCustomOptions: conversion failed', storedOptions);
    return undefined;
};
// only ENUM type was supported for custom options in old dashboard variable schema.
type DeprecatedCustomVariableOptions = {
    type: 'ENUM';
    values: { key: string; label: string; }[];
};
