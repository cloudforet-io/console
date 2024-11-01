import { computed, reactive } from 'vue';

import { cloneDeep, isEmpty, isEqual } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DashboardGlobalVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';
import type {
    DashboardLayout,
    DashboardLayoutWidgetInfo,
    DashboardModel,
    DashboardOptions,
    DashboardVariables,
    DashboardVariableSchemaProperty,
    DashboardVariablesSchema,
    DashboardVars,
    DashboardGlobalVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateDashboardGetParameters } from '@/schema/dashboard/private-dashboard/api-verbs/get';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateWidgetListParameters } from '@/schema/dashboard/private-widget/api-verbs/list';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicDashboardGetParameters } from '@/schema/dashboard/public-dashboard/api-verbs/get';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicWidgetListParameters } from '@/schema/dashboard/public-widget/api-verbs/list';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import getRandomId from '@/lib/random-id-generator';
import WorkspaceVariableModel from '@/lib/variable-models/managed-model/resource-model/workspace-variable-model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { migrateLegacyWidgetOptions } from '@/services/dashboards/helpers/widget-migration-helper';



type WidgetModel = PublicWidgetModel | PrivateWidgetModel;
type GetDashboardParameters = PublicDashboardGetParameters | PrivateDashboardGetParameters;
const DEFAULT_REFRESH_INTERVAL = '5m';
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
    const dashboardStore = useDashboardStore();
    const dashboardState = dashboardStore.state;
    const appContextStore = useAppContextStore();
    const storeState = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });
    const state = reactive({
        loadingDashboard: false,
        dashboardId: '' as string | undefined,
        projectId: undefined as string | undefined,
        options: DASHBOARD_DEFAULT.options as DashboardOptions,
        vars: {} as DashboardVars,
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
        // only for admin
        selectedWorkspaceId: undefined as string | undefined,
        // widget info states
        loadingWidgets: false,
        dashboardWidgets: [] as Array<PublicWidgetModel|PrivateWidgetModel>,
    });

    const getters = reactive({
        dashboardInfo: computed<PublicDashboardModel|PrivateDashboardModel|undefined>(() => {
            const _allDashboardItems = [...dashboardState.privateDashboardItems, ...dashboardState.publicDashboardItems];
            return _allDashboardItems.find((d) => d.dashboard_id === state.dashboardId);
        }),
        dashboardName: computed<string>(() => getters.dashboardInfo?.name || ''),
        dashboardLabels: computed<string[]>(() => getters.dashboardInfo?.labels || []),
        dashboardLayouts: computed<DashboardLayout[]>(() => getters.dashboardInfo?.layouts || []),
        dashboardVarsSchema: computed<DashboardVariablesSchema>(() => getters.dashboardInfo?.vars_schema || {}),
        dashboardVarsSchemaProperties: computed<Record<string, DashboardGlobalVariable>>(() => getters.dashboardInfo?.vars_schema?.properties || {}),
        isPrivate: computed<boolean>(() => !!state.dashboardId?.startsWith('private')),
        //
        isAllVariablesInitialized: computed(() => Object.values(state.variablesInitMap).every((d) => d === true)),
        isDeprecatedDashboard: computed<boolean>(() => getters.dashboardInfo?.version === '1.0'),
        disableManageButtons: computed<boolean>(() => {
            if (state.projectId) return true;
            if (state.dashboardId?.startsWith('private')) return false;
            if (storeState.isAdminMode) return false;
            if (storeState.isWorkspaceOwner) {
                if (getters.dashboardInfo?.workspace_id === '*') return true;
                return false;
            }
            return true;
        }),
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
        refinedVars: computed<DashboardVars>(() => {
            const isProjectSharedDashboard = !!state.projectId;
            const _vars: DashboardVars = cloneDeep(state.vars);
            if (isProjectSharedDashboard && !!state.projectId) {
                _vars.project = [state.projectId];
            }
            if (storeState.isAdminMode) {
                if (state.selectedWorkspaceId && state.selectedWorkspaceId !== 'all') {
                    _vars[WorkspaceVariableModel.meta.idKey] = [state.selectedWorkspaceId];
                } else {
                    delete _vars[WorkspaceVariableModel.meta.idKey];
                }
            } else {
                delete _vars[WorkspaceVariableModel.meta.idKey];
            }
            return _vars;
        }),
        // only for 1.0 legacy dashboard
        dashboardWidgetInfoList: computed<DashboardLayoutWidgetInfo[]>(() => {
            const _dashboardWidget: DashboardLayoutWidgetInfo[] = getters.dashboardInfo?.layouts?.[0].widgets || [];
            return _dashboardWidget.map((info) => ({
                ...info,
                widget_key: info.widget_key ?? getRandomId(),
            })) ?? [];
        }),
    });

    /* Mutations */
    const setOptions = (options: DashboardOptions) => { state.options = options; };
    const setVars = (vars: DashboardVars) => { state.vars = vars; };
    const setVariablesSchema = (variablesSchema: DashboardVariablesSchema) => { state.variablesSchema = variablesSchema; };
    const setVariables = (variables: DashboardVariables) => { state.variables = variables; };
    const setVariablesInitMap = (variablesInitMap: Record<string, boolean>) => { state.variablesInitMap = variablesInitMap; };
    const setDashboardWidgets = (dashboardWidgets: Array<PublicWidgetModel|PrivateWidgetModel>) => { state.dashboardWidgets = dashboardWidgets; };
    const setLoadingWidgets = (loading: boolean) => { state.loadingWidgets = loading; };
    const setProjectId = (projectId?: string) => { state.projectId = projectId; };
    const setShowDateRangeNotification = (visible: boolean) => { state.showDateRangeNotification = visible; };
    const setSelectedWorkspaceId = (workspaceId?: string) => { state.selectedWorkspaceId = workspaceId; };
    /* Actions */
    const reset = () => {
        // set default value of all state
        state.loadingDashboard = false;
        state.dashboardId = undefined;
        setProjectId('');
        setOptions(DASHBOARD_DEFAULT.options);
        setVariables({});
        setVariablesSchema({ properties: {}, order: [] });
        setVariablesInitMap({});
        setVars({});
        setLoadingWidgets(false);
        state.showDateRangeNotification = true;
        state.selectedWorkspaceId = undefined;
    };
    const _setDashboardInfoStoreStateV2 = (dashboardInfo?: DashboardModel) => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }
        const _dashboardInfo = cloneDeep(dashboardInfo);
        state.dashboardId = _dashboardInfo.dashboard_id;
        state.options = {
            date_range: {
                start: _dashboardInfo.options?.date_range?.start,
                end: _dashboardInfo.options?.date_range?.end,
            },
            refresh_interval_option: _dashboardInfo.options?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };
        state.vars = _dashboardInfo.vars ?? {};
    };
    const _setDashboardInfoStoreState = (dashboardInfo?: DashboardModel) => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }

        const _dashboardInfo = cloneDeep(dashboardInfo);
        state.dashboardId = _dashboardInfo.dashboard_id;
        state.options = {
            date_range: {
                start: _dashboardInfo.options?.date_range?.start,
                end: _dashboardInfo.options?.date_range?.end,
            },
            refresh_interval_option: _dashboardInfo.options?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };
        if (!['*', '-'].includes(_dashboardInfo.project_id)) {
            state.projectId = _dashboardInfo.project_id;
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
    const privateDashboardGetFetcher = getCancellableFetcher(SpaceConnector.clientV2.dashboard.privateDashboard.get);
    const publicDashboardGetFetcher = getCancellableFetcher(SpaceConnector.clientV2.dashboard.publicDashboard.get);
    const getDashboardInfo = async (dashboardId: undefined|string) => {
        if (dashboardId === state.dashboardId || dashboardId === undefined) return;

        const isPrivate = dashboardId?.startsWith('private');
        const fetcher = isPrivate ? privateDashboardGetFetcher : publicDashboardGetFetcher;
        // WARN:: from under this line, beware using originState. originState could reference irrelevant dashboard data
        state.dashboardId = dashboardId;
        state.loadingDashboard = true;
        try {
            const params: GetDashboardParameters = { dashboard_id: dashboardId as string };
            const { status, response } = await fetcher<GetDashboardParameters, DashboardModel>(params);
            if (status === 'succeed') {
                if (response.version === '1.0') {
                    _setDashboardInfoStoreState(response);
                } else {
                    _setDashboardInfoStoreStateV2(response);
                }
            }
        } catch (e) {
            reset();
            throw e;
        } finally {
            state.loadingDashboard = false;
        }
    };
    const deleteDashboardWidget = async (widgetId?: string) => {
        if (!widgetId) return;
        const _dashboardLayouts = cloneDeep(getters.dashboardLayouts ?? []);
        const deletedWidgetIndex = _dashboardLayouts[0]?.widgets?.findIndex((d) => d === widgetId);
        if (!deletedWidgetIndex || deletedWidgetIndex === -1) return;
        _dashboardLayouts[0]?.widgets?.splice(deletedWidgetIndex, 1);
        await dashboardStore.updateDashboard(state.dashboardId as string, {
            dashboard_id: state.dashboardId || '',
            layouts: _dashboardLayouts,
        });
    };
    // HACK: only for 1.0 dashboard
    const resetVariables = (originVariables?: DashboardVariables, originVariablesSchema?: DashboardVariablesSchema) => {
        const _originVariables: DashboardVariables = originVariables ?? getters.dashboardInfo?.variables ?? {};
        const _originVariablesSchema: DashboardVariablesSchema = originVariablesSchema ?? getters.dashboardInfo?.variables_schema ?? { properties: {}, order: [] };

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
    //
    const deleteDashboard = async (dashboardId: string) => {
        await dashboardStore.deleteDashboard(dashboardId);
    };
    const listDashboardWidgets = async () => {
        if (!state.dashboardId) return;
        try {
            const isPrivate = state.dashboardId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateWidget.list
                : SpaceConnector.clientV2.dashboard.publicWidget.list;
            const res = await fetcher<PublicWidgetListParameters|PrivateWidgetListParameters, ListResponse<WidgetModel>>({
                dashboard_id: state.dashboardId,
            });
            state.dashboardWidgets = migrateLegacyWidgetOptions(res.results || []);
            return;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const mutations = {
        setOptions,
        setVars,
        setVariablesSchema,
        setVariables,
        setVariablesInitMap,
        setDashboardWidgets,
        setLoadingWidgets,
        setProjectId,
        setShowDateRangeNotification,
        setSelectedWorkspaceId,
    };
    const actions = {
        reset,
        getDashboardInfo,
        deleteDashboardWidget,
        resetVariables,
        deleteDashboard,
        listDashboardWidgets,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
