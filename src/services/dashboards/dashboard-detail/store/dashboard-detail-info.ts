import type { ComputedRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import dayjs from 'dayjs';
import { cloneDeep, flattenDeep } from 'lodash';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import { store } from '@/store';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY } from '@/store/modules/display/config';

import type {
    DateRange, DashboardViewer, DashboardSettings, DashboardVariables, DashboardVariablesSchema,
} from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
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
    enableCurrency: boolean;
    currency: Currency;
    enableDateRange: boolean;
    dateRange: DateRange;
    settings: DashboardSettings;
    variables: DashboardVariables;
    variables_schema: DashboardVariablesSchema;
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
        enableCurrency: false,
        currency: CURRENCY.USD,
        enableDateRange: false,
        dateRange: {
            start: dayjs.utc().format('YYYY-MM-01'),
            end: dayjs.utc().format('YYYY-MM-DD'),
        },
        settings: {
            date_range: {
                enabled: false,
                start: dayjs.utc().format('YYYY-MM-01'),
                end: dayjs.utc().format('YYYY-MM-DD'),
            },
            currency: {
                enabled: false,
                value: CURRENCY.USD,
            },
        },
        variables: {},
        variables_schema: {
            properties: {},
            order: [],
        },
        labels: [],
        // widget info states
        dashboardWidgetInfoList: [],
        loadingWidgets: false,
        widgetDataMap: {},
    });
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

    const resetDashboardSettings = () => {
        state.dateRange = {
            start: dayjs.utc().format('YYYY-MM-01'),
            end: dayjs.utc().format('YYYY-MM-DD'),
        };
        state.settings = {
            date_range: {
                enabled: false,
                start: dayjs.utc().format('YYYY-MM-01'),
                end: dayjs.utc().format('YYYY-MM-DD'),
            },
            currency: {
                enabled: false,
                value: CURRENCY.USD,
            },
        };
    };

    const resetDashboardData = () => {
        originState.dashboardInfo = null;
        state.dashboardName = '';
        state.projectId = '';
        state.enableCurrency = false;
        state.currency = CURRENCY.USD;
        state.enableDateRange = false;
        state.dateRange = {
            start: dayjs.utc().format('YYYY-MM-01'),
            end: dayjs.utc().format('YYYY-MM-DD'),
        };
        state.settings = {
            date_range: {
                enabled: false,
                start: dayjs.utc().format('YYYY-MM-01'),
                end: dayjs.utc().format('YYYY-MM-DD'),
            },
            currency: {
                enabled: false,
                value: CURRENCY.USD,
            },
        };
        state.variables = {};
        state.variables_schema = { properties: {}, order: [] };
        state.labels = [];
    };

    const setDashboardInfo = (dashboardInfo: DashboardModel) => {
        originState.dashboardInfo = dashboardInfo;

        state.dashboardName = dashboardInfo.name;
        state.projectId = (dashboardInfo as ProjectDashboardModel).project_id ?? '';
        state.enableCurrency = dashboardInfo.settings?.currency?.enabled ?? false;
        state.currency = dashboardInfo.settings.currency?.value ?? CURRENCY.USD;
        state.enableDateRange = dashboardInfo.settings?.date_range?.enabled ?? false;
        state.dateRange = dashboardInfo.settings.date_range;
        state.settings = {
            date_range: {
                enabled: dashboardInfo.settings?.date_range?.enabled ?? false,
                start: dashboardInfo.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM-01'),
                end: dashboardInfo.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM-DD'),
            },
            currency: {
                enabled: dashboardInfo.settings?.currency?.enabled ?? false,
                value: dashboardInfo.settings.currency?.value ?? CURRENCY.USD,
            },
        };
        state.variables_schema = dashboardInfo.variables_schema;
        state.variables = dashboardInfo.variables ?? {};
        state.labels = dashboardInfo.labels;
        state.dashboardWidgetInfoList = flattenDeep(dashboardInfo?.layouts ?? []).map((info) => ({
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
    const updateVariableUse = (propertyName: string, use: boolean) => {
        if (!state.variables_schema.properties[propertyName]) return;
        state.variables_schema.properties[propertyName].use = use;
    };

    store.dispatch('reference/loadAll');

    return {
        state,
        originState,
        validationState,
        getDashboardInfo,
        resetDashboardSettings,
        setDashboardInfo,
        toggleWidgetSize,
        // getter
        dashboardWidgetInfoList: computed(() => state.dashboardWidgetInfoList),
        // action
        updateWidgetInfo,
        deleteWidget,
        updateVariableUse,
    };
});

