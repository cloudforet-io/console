import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import dayjs from 'dayjs';
import {
    cloneDeep, flattenDeep, isEqual, union,
} from 'lodash';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


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
interface WidgetInheritVariablesValidMap {
    [widgetKey: string]: {
        [propertyName: string]: boolean;
    }
}

interface DashboardDetailInfoOriginState {
    isProjectDashboard: ComputedRef<boolean>;
    dashboardViewer: ComputedRef<DashboardViewer>;
    dashboardInfo: DashboardModel|null;
    dashboardWidgetInfoList: ComputedRef<DashboardLayoutWidgetInfo[]>;
}
interface DashboardDetailInfoStoreState {
    loadingDashboard: boolean;
    dashboardId: string | undefined;
    projectId: string;
    dashboardName: string;
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
    isDashboardNameValid?: boolean;
    isWidgetLayoutValid: ComputedRef<Record<string, boolean>>;
    widgetInheritVariablesValidMap: ComputedRef<WidgetInheritVariablesValidMap>;
}

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
    },
});

export const useDashboardDetailInfoStore = defineStore('dashboard-detail-info', () => {
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
        dashboardName: '',
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
        isDashboardNameValid: undefined,
        isWidgetLayoutValid: computed(() => ({})), // is all widgets valid
        widgetInheritVariablesValidMap: computed(() => {
            const result = {};
            // originState.dashboardWidgetInfoList.forEach(() => {
            //     result[d.widget_key] = isWidgetValid(d, state.variables_schema);
            // });
            return result;
        }),
    });

    const resetDashboardData = () => {
        originState.dashboardInfo = null;
        state.dashboardName = '';
        state.projectId = '';
        state.settings = DASHBOARD_DEFAULT.settings;
        state.variables = {};
        state.variablesSchema = { properties: {}, order: [] };
        state.labels = [];
    };

    const setDashboardInfo = (dashboardInfo: DashboardModel) => {
        originState.dashboardInfo = dashboardInfo;

        const _dashboardInfo = cloneDeep(dashboardInfo);
        state.dashboardName = _dashboardInfo.name;
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
        };
        state.variablesSchema = {
            properties: { ...managedDashboardVariablesSchema.properties, ..._dashboardInfo.variables_schema?.properties },
            order: union(managedDashboardVariablesSchema.order, _dashboardInfo.variables_schema?.order),
        };
        state.variables = _dashboardInfo.variables ?? {};
        state.labels = _dashboardInfo.labels;
        state.dashboardWidgetInfoList = flattenDeep(_dashboardInfo?.layouts ?? []).map((info) => ({
            ...info,
            widget_key: uuidv4(),
        }));
        state.widgetDataMap = {};
    };

    const getDashboardInfo = async (dashboardId: undefined|string, force = false) => {
        if (!force && (dashboardId === state.dashboardId || dashboardId === undefined)) return;

        state.dashboardId = dashboardId;
        state.loadingDashboard = true;
        try {
            let result: DashboardModel;
            if (originState.isProjectDashboard) {
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
    };
    const resetVariables = () => {
        const originProperties = { ...managedDashboardVariablesSchema.properties, ...originState.dashboardInfo.variables_schema.properties };
        const originOrder = union(managedDashboardVariablesSchema.order, originState.dashboardInfo.variables_schema.order);
        const originVariables = originState.dashboardInfo.variables;

        // reset variables schema
        const _variableSchema = cloneDeep(state.variablesSchema);
        state.variablesSchema.order.forEach((property) => {
            if (!originProperties[property]) return;
            _variableSchema.properties[property].use = originProperties[property].use;
        });
        state.variablesSchema = _variableSchema;

        // reset variables
        const _variables = cloneDeep(state.variables);
        originOrder.forEach((property) => {
            // CASE: existing variable is deleted.
            if (!state.variablesSchema.properties[property]) return;
            if (isEqual(state.variablesSchema.properties[property], originProperties[property])) {
                _variables[property] = originVariables[property];
            }
        });
        state.variables = _variables;
    };

    store.dispatch('reference/loadAll');

    return {
        state,
        originState,
        validationState,
        getDashboardInfo,
        setDashboardInfo,
        toggleWidgetSize,
        // getter
        dashboardWidgetInfoList: computed(() => state.dashboardWidgetInfoList),
        // action
        updateWidgetInfo,
        deleteWidget,
        resetVariables,
    };
});

