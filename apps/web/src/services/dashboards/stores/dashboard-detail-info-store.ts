import { computed, reactive } from 'vue';

import {
    cloneDeep, isEmpty, isEqual,
} from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { RESOURCE_GROUP } from '@/schema/_common/constant';
import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import type {
    DashboardLayoutWidgetInfo,
    DashboardSettings,
    DashboardVariables, DashboardVariableSchemaProperty,
    DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';
import type { GetDashboardParameters } from '@/schema/dashboard/dashboard/api-verbs/get';
import type { DashboardModel } from '@/schema/dashboard/dashboard/model';

import getRandomId from '@/lib/random-id-generator';

import { MANAGED_DASH_VAR_SCHEMA } from '@/services/dashboards/constants/managed-variables-schema';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import type { UpdatableWidgetInfo } from '@/services/dashboards/widgets/_types/widget-type';


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
    let projectPropertySchema = {
        ...MANAGED_DASH_VAR_SCHEMA.properties.project, readonly: true, fixed: true, required: true,
    };
    if (labels?.includes('Asset')) {
        projectPropertySchema = {
            ...MANAGED_DASH_VAR_SCHEMA.properties.project, readonly: true, fixed: true, required: true,
        };
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

export const useDashboardDetailInfoStore = defineStore('dashboard-detail-info', () => {
    const state = reactive({
        dashboardInfo: null as DashboardModel|null,
        loadingDashboard: false,
        dashboardId: '' as string | undefined,
        projectId: '',
        name: '',
        placeholder: '',
        settings: DASHBOARD_DEFAULT.settings as DashboardSettings,
        variables: {} as DashboardVariables,
        variablesSchema: {
            properties: {},
            order: [],
        } as DashboardVariablesSchema,
        variablesInitMap: {} as Record<string, boolean>,
        labels: [] as string[],
        // widget info states
        dashboardWidgetInfoList: [] as DashboardLayoutWidgetInfo[],
        loadingWidgets: false,
        // validation
        isNameValid: undefined as boolean | undefined,
        widgetValidMap: {} as WidgetValidMap,
    });

    const getters = reactive({
        dashboardType: computed(() => state.dashboardInfo?.dashboard_type ?? 'PRIVATE'),
        isWidgetLayoutValid: computed(() => Object.values(state.widgetValidMap).every((d) => d === true)),
        isAllVariablesInitialized: computed(() => {
            if (!state.dashboardInfo) return false;
            return Object.values(state.variablesInitMap).every((d) => d === true);
        }),
    });

    /* Mutations */
    const setName = (name: string) => {
        state.name = name;
    };
    const setIsNameValid = (isValid: boolean) => {
        state.isNameValid = isValid;
    };
    const setSettings = (settings: DashboardSettings) => {
        state.settings = settings;
    };
    const setDashboardWidgetInfoList = (dashboardWidgetInfoList: DashboardLayoutWidgetInfo[]) => {
        state.dashboardWidgetInfoList = dashboardWidgetInfoList;
    };
    const setLabels = (labels: string[]) => {
        state.labels = labels;
    };
    const setVariablesSchema = (variablesSchema: DashboardVariablesSchema) => {
        state.variablesSchema = variablesSchema;
    };
    const setVariables = (variables: DashboardVariables) => {
        state.variables = variables;
    };
    const setVariablesInitMap = (variablesInitMap: Record<string, boolean>) => {
        state.variablesInitMap = variablesInitMap;
    };
    const setDashboardInfoState = (dashboardInfo: DashboardModel) => {
        state.dashboardInfo = dashboardInfo;
    };
    const setLoadingWidgets = (loading: boolean) => {
        state.loadingWidgets = loading;
    };
    const setPlaceholder = (placeholder: string) => {
        state.placeholder = placeholder;
    };
    const setDashboardId = (dashboardId?: string) => {
        state.dashboardId = dashboardId;
    };
    const setProjectId = (projectId: string) => {
        state.projectId = projectId;
    };

    /* Actions */
    const reset = () => {
        // set default value of all state
        state.dashboardInfo = null;
        state.loadingDashboard = false;
        state.dashboardId = undefined;
        state.projectId = '';
        state.name = '';
        state.placeholder = '';
        state.settings = DASHBOARD_DEFAULT.settings;
        state.variables = {};
        state.variablesSchema = { properties: {}, order: [] };
        state.variablesInitMap = {};
        state.labels = [];
        //
        state.dashboardWidgetInfoList = [];
        state.loadingWidgets = false;
        //
        state.isNameValid = undefined;
        state.widgetValidMap = {};
    };
    const setOriginDashboardName = (name: string) => {
        if (state.dashboardInfo) state.dashboardInfo.name = name;
    };
    const revertDashboardData = () => {
        if (!state.dashboardInfo) return;
        setDashboardInfo(state.dashboardInfo);
    };
    const setDashboardInfo = (dashboardInfo?: DashboardModel) => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }

        state.dashboardInfo = dashboardInfo;

        const _dashboardInfo = cloneDeep(dashboardInfo);
        state.name = _dashboardInfo.name;
        if (_dashboardInfo.resource_group === RESOURCE_GROUP.PROJECT) {
            state.projectId = _dashboardInfo.project_id;
        } else {
            state.projectId = '';
        }
        state.settings = {
            date_range: {
                enabled: _dashboardInfo.settings?.date_range?.enabled ?? false,
                start: _dashboardInfo.settings?.date_range?.start,
                end: _dashboardInfo.settings?.date_range?.end,
            },
            refresh_interval_option: _dashboardInfo.settings?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };

        let _variablesSchema = {
            properties: _dashboardInfo.variables_schema?.properties ?? {},
            order: _dashboardInfo.variables_schema?.order,
        };
        let _variables = _dashboardInfo.variables ?? {};
        if (state.projectId) {
            _variablesSchema = refineProjectDashboardVariablesSchema(_variablesSchema, _dashboardInfo.labels);
            _variables = refineProjectDashboardVariables(_variables, state.projectId);
        }
        const _variablesInitMap = {};
        Object.entries<DashboardVariableSchemaProperty>(_variablesSchema.properties).forEach(([propertyName, property]) => {
            if (property.use) _variablesInitMap[propertyName] = false;
        });
        state.variablesSchema = _variablesSchema;
        state.variables = _variables;
        state.variablesInitMap = _variablesInitMap;

        state.labels = _dashboardInfo.labels;
        state.dashboardWidgetInfoList = _dashboardInfo?.layouts?.flat()?.map((info) => ({
            ...info,
            widget_key: info.widget_key ?? getRandomId(),
        })) ?? [];
    };
    const getDashboardInfo = async (dashboardId: undefined|string, force = false) => {
        if (!force && (dashboardId === state.dashboardId || dashboardId === undefined)) return;

        // WARN:: from under this line, beware using originState. originState could reference irrelevant dashboard data
        state.dashboardId = dashboardId;
        state.loadingDashboard = true;
        try {
            const result = await SpaceConnector.clientV2.dashboard.dashboard.get<GetDashboardParameters, DashboardModel>({
                dashboard_id: state.dashboardId as string,
            });
            setDashboardInfo(result);
        } catch (e) {
            reset();
            throw e;
        } finally {
            state.loadingDashboard = false;
        }
    };
    const toggleWidgetSize = (widgetKey: string) => {
        const _targetIndex = state.dashboardWidgetInfoList.findIndex((info) => info.widget_key === widgetKey);
        if (_targetIndex > -1) {
            const _dashboardWidgetInfoList = cloneDeep(state.dashboardWidgetInfoList);
            const widgetInfo = _dashboardWidgetInfoList[_targetIndex];
            const widgetSizes = getWidgetConfig(widgetInfo.widget_name)?.sizes;
            _dashboardWidgetInfoList[_targetIndex] = {
                ...widgetInfo,
                size: (widgetInfo.size === WIDGET_SIZE.full) ? (widgetSizes[0] ?? WIDGET_SIZE.md) : WIDGET_SIZE.full,
            };
            state.dashboardWidgetInfoList = _dashboardWidgetInfoList;
        }
    };
    const updateWidgetInfo = (widgetKey: string, data: UpdatableWidgetInfo) => {
        const targetIndex = state.dashboardWidgetInfoList.findIndex((info) => info.widget_key === widgetKey);
        if (targetIndex > -1) {
            const _dashboardWidgetInfoList = cloneDeep(state.dashboardWidgetInfoList);
            _dashboardWidgetInfoList[targetIndex] = {
                ...state.dashboardWidgetInfoList[targetIndex],
                title: data.title,
                inherit_options: data.inherit_options,
                widget_options: data.widget_options,
                schema_properties: data.schema_properties,
            };
            state.dashboardWidgetInfoList = _dashboardWidgetInfoList;
        }
    };
    const deleteWidget = (widgetKey: string) => {
        state.dashboardWidgetInfoList = state.dashboardWidgetInfoList.filter((info) => info.widget_key !== widgetKey);
        const _widgetValidMap = { ...state.widgetValidMap };
        delete _widgetValidMap[widgetKey];
        state.widgetValidMap = _widgetValidMap;
    };
    const resetVariables = (originVariables?: DashboardVariables, originVariablesSchema?: DashboardVariablesSchema) => {
        const _originVariables: DashboardVariables = originVariables ?? state.dashboardInfo?.variables ?? {};
        const _originVariablesSchema: DashboardVariablesSchema = originVariablesSchema ?? state.dashboardInfo?.variables_schema ?? { properties: {}, order: [] };

        // reset variables schema
        let _variableSchema = cloneDeep(state.variablesSchema);
        state.variablesSchema.order.forEach((property) => {
            if (!_originVariablesSchema?.properties[property]) return;
            _variableSchema.properties[property].use = _originVariablesSchema?.properties[property].use;
        });

        if (state.projectId) _variableSchema = refineProjectDashboardVariablesSchema(_variableSchema);
        state.variablesSchema = _variableSchema;

        // reset variables and variables init map
        let _variables = cloneDeep(state.variables);
        const _variablesInitMap = {};
        _originVariablesSchema.order.forEach((property) => {
            // CASE: existing variable is deleted.
            if (!state.variablesSchema.properties[property]) return;
            if (isEqual(state.variablesSchema.properties[property], _originVariablesSchema?.properties[property])) {
                _variables[property] = _originVariables[property];
                _variablesInitMap[property] = true;
            } else {
                _variablesInitMap[property] = false;
            }
        });
        if (state.projectId) _variables = refineProjectDashboardVariables(_variables, state.projectId);
        state.variables = _variables;
        state.variablesInitMap = _variablesInitMap;
    };
    const updateWidgetValidation = (isValid: boolean, widgetKey: string) => {
        state.widgetValidMap[widgetKey] = isValid;
    };

    const mutations = {
        setName,
        setIsNameValid,
        setSettings,
        setDashboardWidgetInfoList,
        setLabels,
        setVariablesSchema,
        setVariables,
        setVariablesInitMap,
        setDashboardInfoState,
        setLoadingWidgets,
        setPlaceholder,
        setDashboardId,
        setProjectId,
    };
    const actions = {
        reset,
        getDashboardInfo,
        setDashboardInfo,
        revertDashboardData,
        setOriginDashboardName,
        toggleWidgetSize,
        updateWidgetInfo,
        deleteWidget,
        resetVariables,
        updateWidgetValidation,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
