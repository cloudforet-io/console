import { computed, reactive } from 'vue';

import {
    cloneDeep, isEmpty, isEqual,
} from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import type {
    DashboardLayoutWidgetInfo,
    DashboardSettings, DashboardType,
    DashboardVariables, DashboardVariableSchemaProperty,
    DashboardVariablesSchema,
    DashboardTemplate,
} from '@/schema/dashboard/_types/dashboard-type';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import getRandomId from '@/lib/random-id-generator';

import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import type {
    CreateDashboardParameters, DashboardModel, UpdateDashboardParameters, GetDashboardParameters,
} from '@/services/dashboards/types/dashboard-api-schema-type';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-config-helper';
import type { UpdatableWidgetInfo } from '@/services/dashboards/widgets/_types/widget-type';


interface WidgetValidMap {
    [widgetKey: string]: boolean;
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
        ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project, readonly: true, fixed: true, required: true,
    };
    if (labels?.includes('Asset')) {
        projectPropertySchema = {
            ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project, readonly: true, fixed: true, required: true,
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
    const dashboardStore = useDashboardStore();
    const dashboardGetters = dashboardStore.getters;

    const state = reactive({
        dashboardInfo: null as DashboardModel|null,
        loadingDashboard: false,
        dashboardId: '' as string | undefined,
        projectId: undefined as string | undefined,
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
        dashboardType: 'PUBLIC' as DashboardType,
        dashboardScope: 'WORKSPACE' as DashboardScope,
        // widget info states
        dashboardWidgetInfoList: [] as DashboardLayoutWidgetInfo[],
        loadingWidgets: false,
        // validation
        isNameValid: undefined as boolean | undefined,
        widgetValidMap: {} as WidgetValidMap,
    });

    const getters = reactive({
        isWidgetLayoutValid: computed(() => Object.values(state.widgetValidMap).every((d) => d === true)),
        isAllVariablesInitialized: computed(() => Object.values(state.variablesInitMap).every((d) => d === true)),
    });

    /* Mutations */
    const setName = (name: string) => {
        state.name = name;
    };
    const setIsNameValid = (isValid?: boolean) => {
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

    /* Actions */
    const reset = () => {
        // set default value of all state
        setDashboardInfo(null);
        state.loadingDashboard = false;
        state.dashboardId = undefined;
        setProjectId('');
        setName('');
        state.placeholder = '';
        setSettings(DASHBOARD_DEFAULT.settings);
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
    const setDashboardTemplate = (dashboardTemplate: DashboardTemplate) => {
        const _template = cloneDeep(dashboardTemplate);
        state.dashboardId = undefined;
        setName('');
        state.placeholder = _template.name;
        setLabels(_template.labels);
        setSettings(_template.settings);
        let _variablesSchema = _template.variables_schema ?? { properties: {}, order: [] };
        let _variables = _template.variables ?? {};
        if (state.projectId) {
            _variablesSchema = refineProjectDashboardVariablesSchema(_variablesSchema, _template.labels);
            _variables = refineProjectDashboardVariables(_variables, state.projectId);
        }
        setVariablesSchema(_variablesSchema);
        setVariables(_variables);

        const _variablesInitMap = {};
        Object.entries<DashboardVariableSchemaProperty>(_variablesSchema.properties).forEach(([propertyName, property]) => {
            if (property.use) _variablesInitMap[propertyName] = false;
        });
        setVariablesInitMap(_variablesInitMap);

        const _dashboardWidgetInfoList = _template?.layouts?.flat()?.map((info) => ({
            ...info,
            widget_key: info.widget_key ?? getRandomId(),
        })) ?? [];
        setDashboardWidgetInfoList(_dashboardWidgetInfoList);
    };
    const _setDashboardInfoStoreState = (dashboardInfo?: DashboardModel) => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }

        const _dashboardInfo = cloneDeep(dashboardInfo);

        setDashboardInfo(_dashboardInfo);
        state.dashboardId = _dashboardInfo.public_dashboard_id ?? _dashboardInfo.private_dashboard_id;
        setName(_dashboardInfo.name);
        setLabels(_dashboardInfo.labels);
        const _settings = {
            date_range: {
                enabled: _dashboardInfo.settings?.date_range?.enabled ?? false,
                start: _dashboardInfo.settings?.date_range?.start,
                end: _dashboardInfo.settings?.date_range?.end,
            },
            refresh_interval_option: _dashboardInfo.settings?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };
        setSettings(_settings);

        // project_id
        const _projectId = _dashboardInfo.project_id === '*' ? undefined : _dashboardInfo.project_id;
        setProjectId(_projectId);

        // variables, variables schema
        let _variablesSchema = {
            properties: _dashboardInfo.variables_schema?.properties ?? {},
            order: _dashboardInfo.variables_schema?.order,
        };
        let _variables = _dashboardInfo.variables ?? {};
        if (_projectId) {
            _variablesSchema = refineProjectDashboardVariablesSchema(_variablesSchema, _dashboardInfo.labels);
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
        const _dashboardWidgetInfoList = _dashboardInfo?.layouts?.flat()?.map((info) => ({
            ...info,
            widget_key: info.widget_key ?? getRandomId(),
        })) ?? [];
        setDashboardWidgetInfoList(_dashboardWidgetInfoList);
    };
    const getDashboardInfo = async (dashboardId: undefined|string, force = false) => {
        if (!force && (dashboardId === state.dashboardId || dashboardId === undefined)) return;

        const targetDashboards = dashboardGetters.allItems.filter((dashboard) => dashboard.public_dashboard_id === dashboardId || dashboard.private_dashboard_id === dashboardId);
        if (targetDashboards.length > 0) {
            _setDashboardInfoStoreState(targetDashboards[0] as DashboardModel);
            return;
        }

        const isPrivate = dashboardId?.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateDashboard.get
            : SpaceConnector.clientV2.dashboard.publicDashboard.get;
        // WARN:: from under this line, beware using originState. originState could reference irrelevant dashboard data
        state.dashboardId = dashboardId;
        state.loadingDashboard = true;
        try {
            const params: GetDashboardParameters = isPrivate
                ? { private_dashboard_id: dashboardId as string }
                : { public_dashboard_id: dashboardId as string };
            const result = await fetcher<GetDashboardParameters, DashboardModel>(params);
            _setDashboardInfoStoreState(result);
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
            setDashboardWidgetInfoList(_dashboardWidgetInfoList);
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
            setDashboardWidgetInfoList(_dashboardWidgetInfoList);
        }
    };
    const deleteWidget = (widgetKey: string) => {
        const _dashboardWidgetInfoList = state.dashboardWidgetInfoList.filter((info) => info.widget_key !== widgetKey);
        setDashboardWidgetInfoList(_dashboardWidgetInfoList);
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
                ? { variable_type: 'MANAGED', use: propertyInfo.use }
                : propertyInfo;
            return acc;
        }, {});
    const createDashboard = async (params: CreateDashboardParameters, dashboardType?: DashboardType): Promise<DashboardModel> => {
        const _params = {
            ...params,
            variables_schema: {
                order: params.variables_schema?.order ?? [],
                properties: refineSchemaProperties(params.variables_schema?.properties ?? {}),
            },
        };
        const _dashboardType = dashboardType ?? state.dashboardType ?? 'WORKSPACE';
        const res = await dashboardStore.createDashboard(_dashboardType, _params);
        return res;
    };
    const updateDashboard = async (dashboardId: string, params: Partial<UpdateDashboardParameters>) => {
        const isPrivate = dashboardId?.startsWith('private');
        const _params: UpdateDashboardParameters = {
            ...params,
            [isPrivate ? 'private_dashboard_id' : 'public_dashboard_id']: dashboardId,
        };
        if (params.variables_schema) {
            _params.variables_schema = {
                order: params.variables_schema.order,
                properties: refineSchemaProperties(params.variables_schema.properties),
            };
        }
        const res = await dashboardStore.updateDashboard(dashboardId, _params);
        _setDashboardInfoStoreState(res);
    };
    const deleteDashboard = async (dashboardId: string) => {
        await dashboardStore.deleteDashboard(dashboardId);
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
        setDashboardInfo,
        setLoadingWidgets,
        setDashboardType,
        setDashboardScope,
        setProjectId,
    };
    const actions = {
        reset,
        getDashboardInfo,
        setDashboardInfo,
        setOriginDashboardName,
        toggleWidgetSize,
        updateWidgetInfo,
        deleteWidget,
        resetVariables,
        updateWidgetValidation,
        createDashboard,
        updateDashboard,
        deleteDashboard,
        setDashboardTemplate,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
