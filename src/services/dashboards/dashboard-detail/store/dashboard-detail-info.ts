import type { ComputedRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import dayjs from 'dayjs';
import { flattenDeep } from 'lodash';
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
import type { DashboardContainerWidgetInfo } from '@/services/dashboards/dashboard-detail/lib/type';
import type { DashboardModel } from '@/services/dashboards/model';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';

interface WidgetDataMap {
    [widgetKey: string]: any;
}

interface DashboardDetailInfoStoreState {
    loadingDashboard: boolean;
    dashboardId: string;
    isProjectDashboard: ComputedRef<boolean>;
    dashboardInfo: DashboardModel|null;
    dashboardViewer: ComputedRef<DashboardViewer>;
    labelList: string[];
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
    dashboardWidgetInfoList: DashboardContainerWidgetInfo[];
    loadingWidgets: boolean;
    widgetDataMap: WidgetDataMap;
}
export const useDashboardDetailInfoStore = defineStore('dashboard-detail-info', () => {
    const state = reactive<DashboardDetailInfoStoreState>({
        loadingDashboard: false,
        dashboardId: '',
        isProjectDashboard: computed<boolean>(() => state.dashboardId?.startsWith('project')),
        dashboardViewer: computed<DashboardViewer>(() => state.dashboardInfo?.viewers ?? DASHBOARD_VIEWER.PRIVATE),
        dashboardInfo: null,
        dashboardName: '',
        labelList: [],
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
        variables_schema: { properties: {}, order: [] },
        labels: [],
        // widget info states
        dashboardWidgetInfoList: [],
        loadingWidgets: false,
        widgetDataMap: {},
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
        state.dashboardInfo = null;
        state.dashboardName = '';
        state.labelList = [];
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
        state.dashboardWidgetInfoList = [];
    };

    const setDashboardInfo = (dashboardInfo: DashboardModel) => {
        state.dashboardInfo = dashboardInfo;
        state.dashboardName = dashboardInfo.name;

        state.enableCurrency = dashboardInfo.settings?.currency?.enabled ?? false;
        state.currency = dashboardInfo.settings.currency?.value ?? CURRENCY.USD;
        state.enableDateRange = dashboardInfo.settings?.date_range?.enabled ?? false;
        state.dateRange = dashboardInfo.settings.date_range;
        state.settings = {
            date_range: {
                enabled: dashboardInfo.settings?.date_range?.enabled ?? false,
                start: dashboardInfo.settings?.date_range?.start,
                end: dashboardInfo.settings?.date_range?.end,
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
            widgetKey: uuidv4(),
        }));
        state.widgetDataMap = {};
    };

    const getDashboardData = async (dashboardId?: string) => {
        if (dashboardId === state.dashboardId || dashboardId === undefined) return;

        state.dashboardId = dashboardId;
        state.loadingDashboard = true;
        try {
            let result: DashboardModel;
            if (state.isProjectDashboard) {
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
        state.dashboardWidgetInfoList = state.dashboardWidgetInfoList.map((info) => {
            const widgetSizes = getWidgetConfig(info.widget_name)?.sizes;
            if (info.widgetKey === widgetKey && widgetSizes) {
                return {
                    ...info,
                    size: (info.size === WIDGET_SIZE.full) ? (widgetSizes[0] ?? WIDGET_SIZE.md) : WIDGET_SIZE.full,
                };
            }
            return info;
        });
    };
    const initiateAllWidgets = () => {
        const widgetDataMap = {};
        state.dashboardWidgetInfoList.forEach((widget) => {
            widgetDataMap[widget.widgetKey] = state.widgetDataMap[widget.widgetKey];
        });
        state.widgetDataMap = widgetDataMap;
    };

    store.dispatch('reference/loadAll');

    return {
        state,
        getDashboardData,
        resetDashboardSettings,
        setDashboardInfo,
        toggleWidgetSize,
        initiateAllWidgets,
    };
});
