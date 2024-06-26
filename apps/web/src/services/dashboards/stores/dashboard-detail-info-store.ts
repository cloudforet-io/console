import { computed, reactive } from 'vue';

import {
    cloneDeep, isEmpty, isEqual,
} from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type {
    DashboardLayoutWidgetInfo,
    DashboardOptions, DashboardType,
    DashboardVariables, DashboardVariableSchemaProperty,
    DashboardVariablesSchema,
    TemplateType,
    DashboardLayout, DashboardVars,
} from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateWidgetListParameters } from '@/schema/dashboard/private-widget/api-verbs/list';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetListParameters } from '@/schema/dashboard/public-widget/api-verbs/list';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import getRandomId from '@/lib/random-id-generator';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import type {
    CreateDashboardParameters, DashboardModel, GetDashboardParameters,
} from '@/services/dashboards/types/dashboard-api-schema-type';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';


interface WidgetValidMap {
    [widgetKey: string]: boolean;
}
type WidgetModel = PublicWidgetModel | PrivateWidgetModel;

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

    const state = reactive({
        dashboardInfo: null as DashboardModel|null,
        loadingDashboard: false,
        dashboardId: '' as string | undefined,
        projectId: undefined as string | undefined,
        name: '',
        placeholder: '',
        options: DASHBOARD_DEFAULT.options as DashboardOptions,
        vars: {} as Record<string, string[]>,
        variables: {} as DashboardVariables,
        variablesSchema: {
            properties: {},
            order: [],
        } as DashboardVariablesSchema,
        variablesInitMap: {} as Record<string, boolean>,
        labels: [] as string[],
        dashboardType: 'PUBLIC' as DashboardType,
        dashboardScope: 'WORKSPACE' as DashboardScope,
        // template info
        templateId: 'blank', // "templateId" exists in new dashboard, but not in existing dashboard.
        templateType: 'MANAGED' as TemplateType,
        // widget info states
        dashboardWidgetInfoList: [] as DashboardLayoutWidgetInfo[], // only for 1.0 dashboard
        dashboardLayouts: [] as DashboardLayout[], // only for 2.0 dashboard
        loadingWidgets: false,
        dashboardWidgets: [] as Array<PublicWidgetModel|PrivateWidgetModel>,
        // validation
        isNameValid: undefined as boolean | undefined,
        widgetValidMap: {} as WidgetValidMap,
    });

    const getters = reactive({
        isWidgetLayoutValid: computed(() => Object.values(state.widgetValidMap).every((d) => d === true)),
        isAllVariablesInitialized: computed(() => Object.values(state.variablesInitMap).every((d) => d === true)),
        isDeprecatedDashboard: computed<boolean>(() => state.dashboardInfo?.version === '1.0'),
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
            const _vars: Record<string, string[]> = {};
            Object.entries(state.vars).forEach(([k, v]) => {
                const idKey = MANAGED_VARIABLE_MODELS[k]?.meta.idKey;
                if (idKey) _vars[idKey] = v;
            });
            return _vars;
        }),
    });

    /* Mutations */
    const setName = (name: string) => {
        state.name = name;
    };
    const setIsNameValid = (isValid?: boolean) => {
        state.isNameValid = isValid;
    };
    const setOptions = (options: DashboardOptions) => {
        state.options = options;
    };
    const setDashboardWidgetInfoList = (dashboardWidgetInfoList: DashboardLayoutWidgetInfo[]) => {
        state.dashboardWidgetInfoList = dashboardWidgetInfoList;
    };
    const setLabels = (labels: string[]) => {
        state.labels = labels;
    };
    const setVars = (vars: Record<string, string[]>) => {
        state.vars = vars;
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
    const setDashboardInfo = (dashboardInfo: DashboardModel|null) => {
        state.dashboardInfo = dashboardInfo;
    };
    const setLoadingWidgets = (loading: boolean) => {
        state.loadingWidgets = loading;
    };
    const setDashboardType = (dashboardType: DashboardType) => {
        state.dashboardType = dashboardType;
    };
    const setDashboardScope = (dashboardScope: DashboardScope) => {
        state.dashboardScope = dashboardScope;
    };
    const setProjectId = (projectId?: string) => { state.projectId = projectId; };
    const setDashboardLayouts = (layouts: DashboardLayout[]) => { state.dashboardLayouts = layouts; };
    /* Actions */
    const reset = () => {
        // set default value of all state
        setDashboardInfo(null);
        state.loadingDashboard = false;
        state.dashboardId = undefined;
        setProjectId('');
        setName('');
        state.placeholder = '';
        setOptions(DASHBOARD_DEFAULT.options);
        setVariables({});
        setVariablesSchema({ properties: {}, order: [] });
        setVariablesInitMap({});
        setLabels([]);
        setDashboardType('PUBLIC');
        setDashboardScope('WORKSPACE');
        //
        setDashboardWidgetInfoList([]);
        setLoadingWidgets(false);
        //
        setIsNameValid(undefined);
        state.widgetValidMap = {};
    };
    const setOriginDashboardName = (name: string) => {
        if (state.dashboardInfo) state.dashboardInfo.name = name;
    };
    const _setDashboardInfoStoreStateV2 = (dashboardInfo?: DashboardModel) => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }
        const _dashboardInfo = cloneDeep(dashboardInfo);
        const _dashboardScope = _dashboardInfo.resource_group || 'PRIVATE';

        state.dashboardInfo = _dashboardInfo;
        state.dashboardScope = _dashboardScope;
        state.dashboardId = _dashboardInfo.dashboard_id;
        state.name = _dashboardInfo.name;
        state.labels = _dashboardInfo.labels ?? [];
        state.options = {
            date_range: {
                start: _dashboardInfo.options?.date_range?.start,
                end: _dashboardInfo.options?.date_range?.end,
            },
            refresh_interval_option: _dashboardInfo.options?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };
        state.projectId = _dashboardInfo.project_id === '*' ? undefined : _dashboardInfo.project_id;
        state.vars = _dashboardInfo.vars ?? {};
        state.dashboardLayouts = _dashboardInfo.layouts;
    };
    const _setDashboardInfoStoreState = (dashboardInfo?: DashboardModel) => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }

        const _dashboardInfo = cloneDeep(dashboardInfo);

        setDashboardInfo(_dashboardInfo);
        const _dashboardScope = _dashboardInfo.resource_group || 'PRIVATE';
        setDashboardScope(_dashboardScope);
        state.dashboardId = _dashboardInfo.dashboard_id;
        setName(_dashboardInfo.name);
        setLabels(_dashboardInfo.labels);
        const _options = {
            date_range: {
                start: _dashboardInfo.options?.date_range?.start,
                end: _dashboardInfo.options?.date_range?.end,
            },
            refresh_interval_option: _dashboardInfo.options?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };
        setOptions(_options);

        // project_id
        const _projectId = _dashboardInfo.project_id === '*' ? undefined : _dashboardInfo.project_id;
        setProjectId(_projectId);

        // variables, variables schema
        let _variablesSchema: DashboardVariablesSchema = {
            properties: _dashboardInfo.variables_schema?.properties ?? {},
            order: _dashboardInfo.variables_schema?.order,
            fixed_options: _dashboardInfo.variables_schema?.fixed_options,
        };
        let _variables = _dashboardInfo.variables ?? {};
        if (_projectId) {
            _variablesSchema = refineProjectDashboardVariablesSchema(_variablesSchema);
            _variables = refineProjectDashboardVariables(_variables, _projectId);
        }
        const _variablesInitMap = {};
        Object.entries<DashboardVariableSchemaProperty>(_variablesSchema.properties).forEach(([propertyName, property]) => {
            if (property.use) _variablesInitMap[propertyName] = false;
        });
        setVariablesSchema(_variablesSchema);
        setVariables(_variables);
        setVariablesInitMap(_variablesInitMap);

        // widget info states
        const _dashboardWidget = _dashboardInfo.layouts[0].widgets as DashboardLayoutWidgetInfo[];
        const _dashboardWidgetInfoList = _dashboardWidget.map((info) => ({
            ...info,
            widget_key: info.widget_key ?? getRandomId(),
        })) ?? [];
        setDashboardWidgetInfoList(_dashboardWidgetInfoList);
    };
    const getDashboardInfo = async (dashboardId: undefined|string) => {
        if (dashboardId === state.dashboardId || dashboardId === undefined) return;

        const isPrivate = dashboardId?.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateDashboard.get
            : SpaceConnector.clientV2.dashboard.publicDashboard.get;
        // WARN:: from under this line, beware using originState. originState could reference irrelevant dashboard data
        state.dashboardId = dashboardId;
        state.loadingDashboard = true;
        try {
            const params: GetDashboardParameters = { dashboard_id: dashboardId as string };
            const result = await fetcher<GetDashboardParameters, DashboardModel>(params);
            if (result.version === '1.0') {
                _setDashboardInfoStoreState(result);
            } else {
                _setDashboardInfoStoreStateV2(result);
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
        const _dashboardLayouts = cloneDeep(state.dashboardLayouts ?? []);
        const deletedWidgetIndex = _dashboardLayouts[0]?.widgets?.findIndex((d) => d === widgetId);
        if (!deletedWidgetIndex || deletedWidgetIndex === -1) return;
        _dashboardLayouts[0]?.widgets?.splice(deletedWidgetIndex, 1);
        state.dashboardLayouts = _dashboardLayouts;
        await dashboardStore.updateDashboard(state.dashboardId as string, { layouts: _dashboardLayouts });
    };
    // HACK: only for 1.0 dashboard
    const resetVariables = (originVariables?: DashboardVariables, originVariablesSchema?: DashboardVariablesSchema) => {
        const _originVariables: DashboardVariables = originVariables ?? state.dashboardInfo?.variables ?? {};
        const _originVariablesSchema: DashboardVariablesSchema = originVariablesSchema ?? state.dashboardInfo?.variables_schema ?? { properties: {}, order: [] };

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
    const updateWidgetValidation = (isValid: boolean, widgetKey: string) => {
        state.widgetValidMap[widgetKey] = isValid;
    };
    //
    const refineSchemaProperties = (properties: Record<string, DashboardVariableSchemaProperty>): Record<string, DashboardVariableSchemaProperty> => Object.entries(properties)
        .reduce((acc, [property, propertyInfo]) => {
            acc[property] = propertyInfo.variable_type === 'MANAGED'
                ? { variable_type: 'MANAGED', use: propertyInfo.use, fixed: !!propertyInfo.fixed }
                : propertyInfo;
            return acc;
        }, {});
    const createDashboard = async (params: CreateDashboardParameters, dashboardType?: DashboardType): Promise<DashboardModel> => {
        const _params = {
            ...params,
            variables_schema: {
                order: params.variables_schema?.order ?? [],
                properties: refineSchemaProperties(params.variables_schema?.properties ?? {}),
                fixed_options: params.variables_schema?.fixed_options,
            },
        };
        const _dashboardType = dashboardType ?? state.dashboardType ?? 'WORKSPACE';
        const res = await dashboardStore.createDashboard(_dashboardType, _params);
        return res;
    };
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
            const { results } = await fetcher<PublicWidgetListParameters|PrivateWidgetListParameters, ListResponse<WidgetModel>>({
                dashboard_id: state.dashboardId,
            });
            state.dashboardWidgets = results || [];
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };
    const addWidgetToDashboardLayouts = (widgetId: string) => {
        const _layouts = cloneDeep(state.dashboardLayouts || []);
        if (_layouts.length) {
            const _targetLayout = _layouts[0];
            if (_targetLayout.widgets) {
                _targetLayout.widgets.unshift(widgetId);
            } else {
                _targetLayout.widgets = [widgetId];
            }
            _layouts[0] = _targetLayout;
        } else {
            _layouts.push({
                widgets: [widgetId],
            });
        }
        state.dashboardLayouts = _layouts;
    };

    const mutations = {
        setName,
        setIsNameValid,
        setOptions,
        setDashboardWidgetInfoList,
        setLabels,
        setVars,
        setVariablesSchema,
        setVariables,
        setVariablesInitMap,
        setDashboardInfo,
        setLoadingWidgets,
        setDashboardType,
        setDashboardScope,
        setProjectId,
        setDashboardLayouts,
    };
    const actions = {
        reset,
        getDashboardInfo,
        setOriginDashboardName,
        deleteDashboardWidget,
        resetVariables,
        updateWidgetValidation,
        createDashboard,
        deleteDashboard,
        listDashboardWidgets,
        addWidgetToDashboardLayouts,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
