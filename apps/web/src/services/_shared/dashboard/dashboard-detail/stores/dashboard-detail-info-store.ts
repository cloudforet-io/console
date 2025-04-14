// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import { cloneDeep, isEmpty, isEqual } from 'lodash';
import { defineStore } from 'pinia';

import type {
    DashboardLayoutWidgetInfo,
    DashboardModel,
    DashboardOptions,
    DashboardVariables,
    DashboardVariableSchemaProperty,
    DashboardVariablesSchema,
    DashboardGlobalVariablesSchema,
} from '@/api-clients/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';

import getRandomId from '@/lib/random-id-generator';

import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/_shared/dashboard/dashboard-detail/constants/dashboard-managed-variables-schema';

// const DEFAULT_REFRESH_INTERVAL = '5m';
const DEFAULT_REFRESH_INTERVAL = 'off';
export const DASHBOARD_DEFAULT = Object.freeze<{ options: DashboardOptions }>({
    options: {
        date_range: {
            start: undefined,
            end: undefined,
        },
        refresh_interval_option: DEFAULT_REFRESH_INTERVAL,
    },
});

const refineProjectDashboardVariablesSchema = (variablesSchemaInfo: DashboardVariablesSchema): DashboardVariablesSchema => {
    const projectSchemaProperty: DashboardVariableSchemaProperty = {
        ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project, use: true, readonly: true, fixed: true,
    };
    const projectGroupSchemaProperty: DashboardVariableSchemaProperty = {
        ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project_group, use: false, fixed: true,
    };
    const properties = {
        ...variablesSchemaInfo.properties,
        project: projectSchemaProperty,
        project_group: projectGroupSchemaProperty,
    };

    const order = [...variablesSchemaInfo.order];
    const projectIdx = variablesSchemaInfo.order.findIndex((property) => property === 'project');
    if (projectIdx !== -1) order.splice(projectIdx, 1);
    order.splice(0, 0, 'project');

    return {
        properties,
        order,
        fixed_options: variablesSchemaInfo.fixed_options,
    };
};
const refineProjectDashboardVariables = (variables: DashboardVariables, projectId: string): DashboardVariables => {
    const _variables = { ...variables };
    _variables.project = [projectId];
    return _variables;
};

export const useDashboardDetailInfoStore = defineStore('dashboard-detail-info', () => {
    const state = reactive({
        loadingDashboard: false,
        dashboardId: '' as string | undefined,
        dashboard: undefined as PublicDashboardModel|PrivateDashboardModel|undefined,
        projectId: undefined as string | undefined,
        projectGroupId: undefined as string | undefined,
        options: DASHBOARD_DEFAULT.options as DashboardOptions,

        variables: {} as DashboardVariables,
        variablesSchema: {
            properties: {},
            order: [],
        } as DashboardVariablesSchema,
        varsSchema: {
            properties: {},
        } as DashboardGlobalVariablesSchema,
        variablesInitMap: {} as Record<string, boolean>,
        showDateRangeNotification: true,
        variableImportModalVisible: false,
        // only for admin
        selectedWorkspaceId: undefined as string | undefined,
        // widget info states
        loadingWidgets: false,
        dashboardWidgets: [] as Array<PublicWidgetModel|PrivateWidgetModel>,
    });

    const getters = reactive({
        // only for 1.0 legacy dashboard
        isAllVariablesInitialized: computed(() => Object.values(state.variablesInitMap).every((d) => d === true)),
        refinedVariablesSchema: computed<DashboardVariablesSchema>(() => {
            const _storedVariablesSchema = cloneDeep(state.variablesSchema);
            const _refinedVariablesSchema: DashboardVariablesSchema = {
                properties: {},
                order: _storedVariablesSchema.order,
                fixed_options: _storedVariablesSchema.fixed_options,
            };
            Object.entries<DashboardVariableSchemaProperty>(_storedVariablesSchema.properties).forEach(([propertyName, property]) => {
                if (property.variable_type === 'MANAGED') {
                    _refinedVariablesSchema.properties[propertyName] = {
                        ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties[propertyName],
                        use: property.use,
                    };
                    if (typeof property.fixed === 'boolean') {
                        _refinedVariablesSchema.properties[propertyName].fixed = property.fixed;
                    }
                    if (typeof property.readonly === 'boolean') {
                        _refinedVariablesSchema.properties[propertyName].readonly = property.readonly;
                    }
                } else {
                    _refinedVariablesSchema.properties[propertyName] = property;
                }
            });
            return _refinedVariablesSchema;
        }),
        dashboardWidgetInfoList: computed<DashboardLayoutWidgetInfo[]>(() => {
            const _dashboardWidget: DashboardLayoutWidgetInfo[] = state.dashboard?.layouts?.[0].widgets || [];
            return _dashboardWidget.map((info) => ({
                ...info,
                widget_key: info.widget_key ?? getRandomId(),
            })) ?? [];
        }),
    });

    /* Mutations */
    const setOptions = (options: DashboardOptions) => { state.options = options; };
    const setVariablesSchema = (variablesSchema: DashboardVariablesSchema) => { state.variablesSchema = variablesSchema; };
    const setVariables = (variables: DashboardVariables) => { state.variables = variables; };
    const setVariablesInitMap = (variablesInitMap: Record<string, boolean>) => { state.variablesInitMap = variablesInitMap; };
    const setDashboardWidgets = (dashboardWidgets: Array<PublicWidgetModel|PrivateWidgetModel>) => { state.dashboardWidgets = dashboardWidgets; };
    const setLoadingWidgets = (loading: boolean) => { state.loadingWidgets = loading; };
    const setProjectId = (projectId?: string) => { state.projectId = projectId; };
    const setProjectGroupId = (projectGroupId?: string) => { state.projectGroupId = projectGroupId; };
    const setShowDateRangeNotification = (visible: boolean) => { state.showDateRangeNotification = visible; };
    const setSelectedWorkspaceId = (workspaceId?: string) => { state.selectedWorkspaceId = workspaceId; };
    const setVariableImportModalVisible = (visible: boolean) => { state.variableImportModalVisible = visible; };
    /* Actions */
    const reset = () => {
        // set default value of all state
        state.loadingDashboard = false;
        state.dashboardId = undefined;
        setProjectId('');
        setProjectGroupId('');
        setOptions(DASHBOARD_DEFAULT.options);
        setVariables({});
        setVariablesSchema({ properties: {}, order: [] });
        setVariablesInitMap({});
        setLoadingWidgets(false);
        state.showDateRangeNotification = true;
        state.selectedWorkspaceId = undefined;
    };
    const setDashboardInfoStoreStateV2 = (dashboardInfo?: DashboardModel) => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }
        state.projectId = dashboardInfo.project_id;
        state.projectGroupId = dashboardInfo.project_group_id;
        state.dashboard = dashboardInfo;
        const _dashboardInfo = cloneDeep(dashboardInfo);
        state.dashboardId = _dashboardInfo.dashboard_id;
        state.options = {
            date_range: {
                start: _dashboardInfo.options?.date_range?.start,
                end: _dashboardInfo.options?.date_range?.end,
            },
            refresh_interval_option: _dashboardInfo.options?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };
    };
    const setDashboardInfoStoreState = (dashboardInfo?: DashboardModel) => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }

        const _dashboardInfo = cloneDeep(dashboardInfo);
        state.dashboardId = _dashboardInfo.dashboard_id;
        state.dashboard = _dashboardInfo;
        state.options = {
            date_range: {
                start: _dashboardInfo.options?.date_range?.start,
                end: _dashboardInfo.options?.date_range?.end,
            },
            refresh_interval_option: _dashboardInfo.options?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };
        if (!['*', '-'].includes(_dashboardInfo?.project_id)) {
            state.projectId = _dashboardInfo?.project_id;
        }

        // variables, variables schema
        const _variablesSchema: DashboardVariablesSchema = {
            properties: _dashboardInfo.variables_schema?.properties ?? {},
            order: _dashboardInfo.variables_schema?.order || [],
            fixed_options: _dashboardInfo.variables_schema?.fixed_options,
        };
        const _variables = _dashboardInfo.variables ?? {};
        const _variablesInitMap = {};
        Object.entries<DashboardVariableSchemaProperty>(_variablesSchema.properties).forEach(([propertyName, property]) => {
            if (property.use) _variablesInitMap[propertyName] = false;
        });
        state.variablesSchema = _variablesSchema;
        state.variables = _variables;
        state.variablesInitMap = _variablesInitMap;
    };
    // HACK: only for 1.0 dashboard
    const resetVariables = (originVariables?: DashboardVariables, originVariablesSchema?: DashboardVariablesSchema) => {
        const _originVariables: DashboardVariables = originVariables ?? state.variables ?? {};
        const _originVariablesSchema: DashboardVariablesSchema = originVariablesSchema ?? state.variablesSchema ?? { properties: {}, order: [] };

        // reset variables schema
        let _variableSchema = cloneDeep(state.variablesSchema);
        state.variablesSchema.order?.forEach((property) => {
            if (!_originVariablesSchema?.properties[property]) return;
            _variableSchema.properties[property].use = _originVariablesSchema?.properties[property].use;
        });

        if (state.projectId) _variableSchema = refineProjectDashboardVariablesSchema(_variableSchema);
        setVariablesSchema(_variableSchema);

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
        setVariables(_variables);
        setVariablesInitMap(_variablesInitMap);
    };

    const mutations = {
        setOptions,
        setVariablesSchema,
        setVariables,
        setVariablesInitMap,
        setDashboardWidgets,
        setLoadingWidgets,
        setProjectId,
        setProjectGroupId,
        setShowDateRangeNotification,
        setSelectedWorkspaceId,
        setVariableImportModalVisible,
    };
    const actions = {
        reset,
        resetVariables,
        setDashboardInfoStoreStateV2,
        setDashboardInfoStoreState,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
