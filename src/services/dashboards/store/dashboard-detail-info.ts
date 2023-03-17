import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import dayjs from 'dayjs';
import {
    cloneDeep, flattenDeep, isEmpty, isEqual, union,
} from 'lodash';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import { SpaceConnector } from '@/space-connector';
import { store } from '@/store';

import { CURRENCY } from '@/store/modules/display/config';

import type {
    DashboardViewer, DashboardSettings, DashboardVariables, DashboardVariablesSchema,
} from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import { managedDashboardVariablesSchema } from '@/services/dashboards/managed-variables-schema';
import type { DashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

interface WidgetDataMap {
    [widgetKey: string]: any;
}
interface WidgetValidMap {
    [widgetKey: string]: boolean;
}

interface DashboardDetailInfoOriginState {
    isProjectDashboard: ComputedRef<boolean>;
    dashboardViewer: ComputedRef<DashboardViewer>;
    dashboardInfo: DashboardModel|null;
    dashboardWidgetInfoList: ComputedRef<DashboardLayoutWidgetInfo[]>;
}
export interface DashboardDetailInfoStoreState {
    loadingDashboard: boolean;
    dashboardId: string | undefined;
    projectId: string;
    name: string;
    placeholder: string;
    settings: DashboardSettings;
    variables: DashboardVariables;
    variablesSchema: DashboardVariablesSchema;
    labels: string[];
    // widget info states
    dashboardWidgetInfoList: DashboardLayoutWidgetInfo[];
    loadingWidgets: boolean;
    widgetDataMap: WidgetDataMap;
}
interface ValidationState {
    isNameValid?: boolean;
    isWidgetLayoutValid: ComputedRef<boolean>;
    widgetValidMap: WidgetValidMap;
}
const DEFAULT_REFRESH_INTERVAL = '5m';
const DASHBOARD_DEFAULT = Object.freeze<{ settings: DashboardSettings }>({
    settings: {
        date_range: {
            start: dayjs.utc().format('YYYY-MM-01'),
            end: dayjs.utc().format('YYYY-MM-DD'),
            enabled: false,
        },
        currency: {
            enabled: false,
            value: CURRENCY.USD,
        },
        refresh_interval_option: DEFAULT_REFRESH_INTERVAL,
    },
});

const refineVariablesSchema = (variablesSchemaInfo?: DashboardVariablesSchema): DashboardVariablesSchema => ({
    properties: { ...managedDashboardVariablesSchema.properties, ...variablesSchemaInfo?.properties ?? {} },
    order: union(managedDashboardVariablesSchema.order, variablesSchemaInfo?.order ?? []),
});
const refineProjectDashboardVariablesSchema = (variablesSchemaInfo: DashboardVariablesSchema): DashboardVariablesSchema => {
    const projectPropertySchema = { ...managedDashboardVariablesSchema.properties.project, disabled: true };
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
    // CAUTION: don't directly access and modify originState outside this store.
    const originState = reactive<DashboardDetailInfoOriginState>({
        isProjectDashboard: computed<boolean>(() => {
            if (state.projectId) return true;
            return !!state.dashboardId?.startsWith('project');
        }),
        dashboardViewer: computed<DashboardViewer>(() => originState.dashboardInfo?.viewers ?? DASHBOARD_VIEWER.PRIVATE),
        dashboardInfo: null as DashboardModel|null,
        dashboardWidgetInfoList: computed<DashboardLayoutWidgetInfo[]>(() => flattenDeep(originState.dashboardInfo?.layouts ?? [])),
    });
    const state = reactive<DashboardDetailInfoStoreState>({
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
        labels: [],
        // widget info states
        dashboardWidgetInfoList: [],
        loadingWidgets: false,
        widgetDataMap: {},
    }) as UnwrapRef<DashboardDetailInfoStoreState>;
    const validationState = reactive<ValidationState>({
        isNameValid: undefined,
        isWidgetLayoutValid: computed(() => Object.values(validationState.widgetValidMap).every((d) => d === true)),
        widgetValidMap: {},
    }) as UnwrapRef<ValidationState>;

    const resetDashboardData = () => {
        originState.dashboardInfo = null;
        state.name = '';
        state.placeholder = '';
        state.projectId = '';
        state.settings = DASHBOARD_DEFAULT.settings;
        state.variables = {};
        state.variablesSchema = { properties: {}, order: [] };
        state.labels = [];
        //
        validationState.isNameValid = undefined;
        validationState.widgetValidMap = {};
    };

    const setOriginDashboardName = (name: string) => {
        originState.dashboardInfo.name = name;
    };

    const revertDashboardData = () => {
        setDashboardInfo(originState.dashboardInfo);
    };

    const setDashboardInfo = (dashboardInfo?: DashboardModel): void => {
        if (!dashboardInfo || isEmpty(dashboardInfo)) {
            console.error('setDashboardInfo failed', dashboardInfo);
            return;
        }

        originState.dashboardInfo = dashboardInfo;

        const _dashboardInfo = cloneDeep(dashboardInfo);
        state.name = _dashboardInfo.name;
        state.projectId = (_dashboardInfo as ProjectDashboardModel).project_id ?? '';
        state.settings = {
            date_range: {
                enabled: _dashboardInfo.settings?.date_range?.enabled ?? false,
                start: _dashboardInfo.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM-01'),
                end: _dashboardInfo.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM-DD'),
            },
            currency: {
                enabled: _dashboardInfo.settings?.currency?.enabled ?? false,
                value: _dashboardInfo.settings.currency?.value ?? CURRENCY.USD,
            },
            refresh_interval_option: _dashboardInfo.settings?.refresh_interval_option ?? DEFAULT_REFRESH_INTERVAL,
        };

        let _variablesSchema = refineVariablesSchema(_dashboardInfo.variables_schema);
        let _variables = _dashboardInfo.variables ?? {};
        if (state.projectId) {
            _variablesSchema = refineProjectDashboardVariablesSchema(_variablesSchema);
            _variables = refineProjectDashboardVariables(_variables, state.projectId);
        }
        state.variablesSchema = _variablesSchema;
        state.variables = _variables;

        state.labels = _dashboardInfo.labels;
        state.dashboardWidgetInfoList = _dashboardInfo?.layouts?.flat()?.map((info) => ({
            ...info,
            widget_key: info.widget_key ?? uuidv4(),
        })) ?? [];
    };

    const getDashboardInfo = async (dashboardId: undefined|string, force = false) => {
        if (!force && (dashboardId === state.dashboardId || dashboardId === undefined)) return;

        // WARN:: from under this line, beware using originState. originState could reference irrelevant dashboard data
        state.dashboardId = dashboardId;
        state.loadingDashboard = true;
        try {
            let result: DashboardModel;
            if (dashboardId?.startsWith('project')) {
                result = await SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: state.dashboardId });
            } else {
                result = await SpaceConnector.clientV2.dashboard.domainDashboard.get({ domain_dashboard_id: state.dashboardId });
            }
            setDashboardInfo(result);
        } catch (e) {
            resetDashboardData();
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

    const updateWidgetInfo = (widgetKey: string, data: Partial<DashboardLayoutWidgetInfo>) => {
        const targetIndex = state.dashboardWidgetInfoList.findIndex((info) => info.widget_key === widgetKey);
        if (targetIndex > -1) {
            const _dashboardWidgetInfoList = cloneDeep(state.dashboardWidgetInfoList);
            _dashboardWidgetInfoList[targetIndex] = {
                ...state.dashboardWidgetInfoList[targetIndex],
                ...data,
            };
            state.dashboardWidgetInfoList = _dashboardWidgetInfoList;
        }
    };

    const deleteWidget = (widgetKey: string) => {
        state.dashboardWidgetInfoList = state.dashboardWidgetInfoList.filter((info) => info.widget_key !== widgetKey);
        const _widgetValidMap = { ...validationState.widgetValidMap };
        delete _widgetValidMap[widgetKey];
        validationState.widgetValidMap = _widgetValidMap;
    };
    const resetVariables = () => {
        const {
            properties: originProperties,
            order: originOrder,
        } = refineVariablesSchema(originState.dashboardInfo.variables_schema);
        const originVariables = originState.dashboardInfo.variables;

        // reset variables schema
        let _variableSchema = cloneDeep(state.variablesSchema);
        state.variablesSchema.order.forEach((property) => {
            if (!originProperties[property]) return;
            _variableSchema.properties[property].use = originProperties[property].use;
        });
        if (state.projectId) _variableSchema = refineProjectDashboardVariablesSchema(_variableSchema);
        state.variablesSchema = _variableSchema;

        // reset variables
        let _variables = cloneDeep(state.variables);
        originOrder.forEach((property) => {
            // CASE: existing variable is deleted.
            if (!state.variablesSchema.properties[property]) return;
            if (isEqual(state.variablesSchema.properties[property], originProperties[property])) {
                _variables[property] = originVariables[property];
            }
        });
        if (state.projectId) _variables = refineProjectDashboardVariables(_variables, state.projectId);
        state.variables = _variables;
    };

    const updateWidgetValidation = (isValid: boolean, widgetKey: string) => {
        validationState.widgetValidMap[widgetKey] = isValid;
    };

    store.dispatch('reference/loadAll');

    return {
        state,
        originState,
        validationState,
        revertDashboardData,
        getDashboardInfo,
        setDashboardInfo,
        toggleWidgetSize,
        // getter
        dashboardWidgetInfoList: computed(() => state.dashboardWidgetInfoList),
        // action
        updateWidgetInfo,
        deleteWidget,
        resetVariables,
        updateWidgetValidation,
        setOriginDashboardName,
    };
});

