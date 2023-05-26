import dayjs from 'dayjs';
import {
    cloneDeep, isEmpty, isEqual,
} from 'lodash';
import type { _GettersTree } from 'pinia';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { CURRENCY } from '@/store/modules/display/config';

import { ASSET_REFERENCE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_REFERENCE_TYPE_INFO } from '@/lib/reference/cost-reference-config';

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
    labels: string[];
    // widget info states
    dashboardWidgetInfoList: DashboardLayoutWidgetInfo[];
    loadingWidgets: boolean;
    widgetDataMap: WidgetDataMap;
    // validation
    isNameValid?: boolean;
    widgetValidMap: WidgetValidMap;
}
type DashboardDetailInfoStoreGetters = _GettersTree<{
    isProjectDashboard: boolean;
    dashboardViewer: DashboardViewer;
    isWidgetLayoutValid: boolean;
}> & _GettersTree<DashboardDetailInfoStoreState>;
interface DashboardDetailInfoStoreActions {
    resetDashboardData: any;
    setOriginDashboardName: any;
    revertDashboardData: any;
    setDashboardInfo: any;
    getDashboardInfo: any;
    toggleWidgetSize: any;
    updateWidgetInfo: any;
    deleteWidget: any;
    resetVariables: any;
    updateWidgetValidation: any;
    convertDashboardInfoByChangedVariableSchema: any;
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

const refineVariablesSchema = (variablesSchemaInfo?: DashboardVariablesSchema, labels?: string[]): DashboardVariablesSchema => {
    if (isEmpty(variablesSchemaInfo?.properties)) { // create dashboard case
        const _managedDashboardVariablesSchema = cloneDeep(managedDashboardVariablesSchema);
        if (labels?.includes('Asset')) {
            Object.entries(_managedDashboardVariablesSchema.properties).forEach(([key, value]) => {
                if (Object.keys(ASSET_REFERENCE_TYPE_INFO).includes(key)) {
                    _managedDashboardVariablesSchema.properties[key] = { ...value, use: true };
                }
            });
        } else if (labels?.includes('Cost')) {
            Object.entries(_managedDashboardVariablesSchema.properties).forEach(([key, value]) => {
                if (Object.keys(COST_REFERENCE_TYPE_INFO).includes(key)) {
                    _managedDashboardVariablesSchema.properties[key] = { ...value, use: true };
                }
            });
        }
        return _managedDashboardVariablesSchema;
    }
    return {
        properties: { ...variablesSchemaInfo?.properties ?? {} },
        order: variablesSchemaInfo?.order ?? [],
    };
};
const refineProjectDashboardVariablesSchema = (variablesSchemaInfo: DashboardVariablesSchema, labels?: string[]): DashboardVariablesSchema => {
    let projectPropertySchema = { ...managedDashboardVariablesSchema.properties.project, disabled: true };
    if (labels?.includes('Asset')) {
        projectPropertySchema = { ...managedDashboardVariablesSchema.properties.project, disabled: true };
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

export const useDashboardDetailInfoStore = defineStore<string, DashboardDetailInfoStoreState, DashboardDetailInfoStoreGetters, DashboardDetailInfoStoreActions>('dashboard-detail-info', {
    state: () => ({
        dashboardInfo: null as DashboardModel|null,
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
        // validation
        isNameValid: undefined,
        widgetValidMap: {},
    }),
    getters: {
        isProjectDashboard: (state) => {
            if (state.projectId) return true;
            return !!state.dashboardId?.startsWith('project');
        },
        dashboardViewer: (state) => state.dashboardInfo?.viewers ?? DASHBOARD_VIEWER.PRIVATE,
        isWidgetLayoutValid: (state) => Object.values(state.widgetValidMap).every((d) => d === true),
    },
    actions: {
        resetDashboardData() {
            this.dashboardInfo = null;
            this.name = '';
            this.placeholder = '';
            this.projectId = '';
            this.settings = DASHBOARD_DEFAULT.settings;
            this.variables = {};
            this.variablesSchema = { properties: {}, order: [] };
            this.labels = [];
            //
            this.isNameValid = undefined;
            this.widgetValidMap = {};
        },
        setOriginDashboardName(name: string) {
            if (this.dashboardInfo) this.dashboardInfo.name = name;
        },
        revertDashboardData() {
            this.setDashboardInfo(this.dashboardInfo);
        },
        setDashboardInfo(dashboardInfo?: DashboardModel) {
            if (!dashboardInfo || isEmpty(dashboardInfo)) {
                console.error('setDashboardInfo failed', dashboardInfo);
                return;
            }

            this.dashboardInfo = dashboardInfo;

            const _dashboardInfo = cloneDeep(dashboardInfo);
            this.name = _dashboardInfo.name;
            this.projectId = (_dashboardInfo as ProjectDashboardModel).project_id ?? '';
            this.settings = {
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

            let _variablesSchema = refineVariablesSchema(_dashboardInfo.variables_schema, _dashboardInfo.labels);
            let _variables = _dashboardInfo.variables ?? {};
            if (this.projectId) {
                _variablesSchema = refineProjectDashboardVariablesSchema(_variablesSchema, _dashboardInfo.labels);
                _variables = refineProjectDashboardVariables(_variables, this.projectId);
            }
            this.variablesSchema = _variablesSchema;
            this.variables = _variables;

            this.labels = _dashboardInfo.labels;
            this.dashboardWidgetInfoList = _dashboardInfo?.layouts?.flat()?.map((info) => ({
                ...info,
                widget_key: info.widget_key ?? uuidv4(),
            })) ?? [];
        },
        async getDashboardInfo(dashboardId: undefined|string, force = false) {
            if (!force && (dashboardId === this.dashboardId || dashboardId === undefined)) return;

            // WARN:: from under this line, beware using originState. originState could reference irrelevant dashboard data
            this.dashboardId = dashboardId;
            this.loadingDashboard = true;
            try {
                let result: DashboardModel;
                if (dashboardId?.startsWith('project')) {
                    result = await SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: this.dashboardId });
                } else {
                    result = await SpaceConnector.clientV2.dashboard.domainDashboard.get({ domain_dashboard_id: this.dashboardId });
                }
                const resultWithConvertedVariableSchema = this.convertDashboardInfoByChangedVariableSchema(result);
                this.setDashboardInfo(resultWithConvertedVariableSchema);
            } catch (e) {
                this.resetDashboardData();
                throw e;
            } finally {
                this.loadingDashboard = false;
            }
        },
        toggleWidgetSize(widgetKey: string) {
            const _targetIndex = this.dashboardWidgetInfoList.findIndex((info) => info.widget_key === widgetKey);
            if (_targetIndex > -1) {
                const _dashboardWidgetInfoList = cloneDeep(this.dashboardWidgetInfoList);
                const widgetInfo = _dashboardWidgetInfoList[_targetIndex];
                const widgetSizes = getWidgetConfig(widgetInfo.widget_name)?.sizes;
                _dashboardWidgetInfoList[_targetIndex] = {
                    ...widgetInfo,
                    size: (widgetInfo.size === WIDGET_SIZE.full) ? (widgetSizes[0] ?? WIDGET_SIZE.md) : WIDGET_SIZE.full,
                };
                this.dashboardWidgetInfoList = _dashboardWidgetInfoList;
            }
        },
        updateWidgetInfo(widgetKey: string, data: Partial<DashboardLayoutWidgetInfo>) {
            const targetIndex = this.dashboardWidgetInfoList.findIndex((info) => info.widget_key === widgetKey);
            if (targetIndex > -1) {
                const _dashboardWidgetInfoList = cloneDeep(this.dashboardWidgetInfoList);
                _dashboardWidgetInfoList[targetIndex] = {
                    ...this.dashboardWidgetInfoList[targetIndex],
                    ...data,
                };
                this.dashboardWidgetInfoList = _dashboardWidgetInfoList;
            }
        },
        deleteWidget(widgetKey: string) {
            this.dashboardWidgetInfoList = this.dashboardWidgetInfoList.filter((info) => info.widget_key !== widgetKey);
            const _widgetValidMap = { ...this.widgetValidMap };
            delete _widgetValidMap[widgetKey];
            this.widgetValidMap = _widgetValidMap;
        },
        resetVariables() {
            const {
                properties: originProperties,
                order: originOrder,
            } = refineVariablesSchema(this.dashboardInfo?.variables_schema, this.dashboardInfo?.labels);
            const originVariables = this.dashboardInfo?.variables ?? {};

            // reset variables schema
            let _variableSchema = cloneDeep(this.variablesSchema);
            this.variablesSchema.order.forEach((property) => {
                if (!originProperties[property]) return;
                _variableSchema.properties[property].use = originProperties[property].use;
            });
            if (this.projectId) _variableSchema = refineProjectDashboardVariablesSchema(_variableSchema, this.labels);
            this.variablesSchema = _variableSchema;

            // reset variables
            let _variables = cloneDeep(this.variables);
            originOrder.forEach((property) => {
                // CASE: existing variable is deleted.
                if (!this.variablesSchema.properties[property]) return;
                if (isEqual(this.variablesSchema.properties[property], originProperties[property])) {
                    _variables[property] = originVariables[property];
                }
            });
            if (this.projectId) _variables = refineProjectDashboardVariables(_variables, this.projectId);
            this.variables = _variables;
        },
        updateWidgetValidation(isValid: boolean, widgetKey: string) {
            this.widgetValidMap[widgetKey] = isValid;
        },
        // This action is for handling dashboard data that does not reflect schema changes.
        convertDashboardInfoByChangedVariableSchema(dashboardInfo: DashboardModel) {
            const _dashboardInfo = cloneDeep(dashboardInfo);
            Object.entries(_dashboardInfo.variables_schema.properties).forEach(([k, v]) => {
                if (!v.options) {
                    _dashboardInfo.variables_schema.properties[k] = {
                        ...managedDashboardVariablesSchema.properties[k],
                    };
                } else if (Array.isArray(v.options)) {
                    _dashboardInfo.variables_schema.properties[k] = {
                        ...v,
                        options: {
                            type: 'ENUM',
                            values: v.options.map((d) => ({ key: d, label: d })),
                        },
                    };
                }
            });
            return _dashboardInfo;
        },
    },
});

