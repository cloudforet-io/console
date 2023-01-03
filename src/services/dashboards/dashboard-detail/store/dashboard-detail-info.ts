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
    DateRange, DashboardViewer, DashboardSettings, DashboardVariables,
} from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardContainerWidgetInfo } from '@/services/dashboards/dashboard-detail/lib/type';
import type { DashboardModel } from '@/services/dashboards/model';


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
    // widget info states
    dashboardWidgetInfoList: DashboardContainerWidgetInfo[];
    loadingWidgets: boolean;
}
export const useDashboardDetailInfoStore = defineStore('dashboard-detail-info', () => {
    const state = reactive<DashboardDetailInfoStoreState>({
        loadingDashboard: false,
        dashboardId: '',
        isProjectDashboard: computed<boolean>(() => state.dashboardId.startsWith('project')),
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
        // widget info states
        dashboardWidgetInfoList: [],
        loadingWidgets: false,
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
        state.dashboardWidgetInfoList = [];
    };

    const setDashboardInfo = (dashboardInfo: DashboardModel) => {
        state.dashboardInfo = dashboardInfo;
        state.dashboardName = dashboardInfo.name;

        state.enableCurrency = dashboardInfo.settings.currency.enabled;
        state.currency = dashboardInfo.settings.currency?.value ?? CURRENCY.USD;
        state.enableDateRange = dashboardInfo.settings.date_range.enabled;
        state.dateRange = dashboardInfo.settings.date_range;
        state.settings = {
            date_range: {
                enabled: dashboardInfo.settings.date_range.enabled,
                start: dashboardInfo.settings.date_range.start,
                end: dashboardInfo.settings.date_range.end,
            },
            currency: {
                enabled: dashboardInfo.settings.currency.enabled,
                value: dashboardInfo.settings.currency?.value ?? CURRENCY.USD,
            },
        };
        state.variables = dashboardInfo.variables ?? {};
        state.dashboardWidgetInfoList = flattenDeep(dashboardInfo?.layouts ?? []).map((info) => ({
            ...info,
            widgetKey: uuidv4(),
        }));
    };

    const getDashboardData = async (dashboardId: string) => {
        if (dashboardId === state.dashboardId) return;

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

    store.dispatch('reference/loadAll');

    return {
        state,
        getDashboardData,
        resetDashboardSettings,
        setDashboardInfo,
    };
});
