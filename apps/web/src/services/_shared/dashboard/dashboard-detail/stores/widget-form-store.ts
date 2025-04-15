// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, reactive } from 'vue';

import { flattenDeep, union } from 'lodash';
import { defineStore } from 'pinia';

import type { DashboardLayoutWidgetInfo } from '@/api-clients/dashboard/_types/dashboard-type';
import type {
    InheritOptions, WidgetConfig, WidgetOptions,
} from '@/api-clients/dashboard/_types/widget-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { getUpdatedWidgetInfo } from '@/services/_shared/dashboard/dashboard-detail/helpers/dashboard-widget-info-helper';
import { mergeBaseWidgetState } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/merge-base-widget-state';
import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';
import type { UpdatableWidgetInfo } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import { useWidgetTitleInput } from '@/services/dashboards/composables/use-widget-title-input';
import type { MergedBaseWidgetState } from '@/services/dashboards/widgets/_composables/use-widget/merge-base-widget-state';


/* Description
    * This store is used to get/manage 'a' widget data.
    * This store is used in
    *   1) widget view modal (in dashboard detail page)
    *   2) widget edit modal (in dashboard customize page)
* */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface PartialDashboardLayoutWidgetInfo extends DashboardLayoutWidgetInfo {
    widget_key?: string;
}

interface Getters {
    widgetConfig: ComputedRef<WidgetConfig|undefined>;
    updatedWidgetInfo: ComputedRef<UpdatableWidgetInfo|undefined>;
    title: ComputedRef<string>;
}
const DASHBOARD_SCOPE = {
    DOMAIN: 'DOMAIN',
    WORKSPACE: 'WORKSPACE',
    PROJECT: 'PROJECT',
    PRIVATE: 'PRIVATE',
} as const;
type DashboardScope = keyof typeof DASHBOARD_SCOPE;

export const useWidgetFormStore = defineStore('widget-form', () => {
    const appContextStore = useAppContextStore();
    const appContextGetters = appContextStore.getters;
    const dashboardDetailStore = useDashboardDetailInfoStore();
    const dashboardDetailState = dashboardDetailStore.state;
    const dashboardDetailGetters = dashboardDetailStore.getters;
    const {
        title,
    } = useWidgetTitleInput();

    const initialState = {
        widgetConfigId: undefined as string|undefined, // widget config name that is used to get widget config
        widgetKey: undefined as string|undefined, // widget key to find widget in dashboard layout
        templateWidgetId: undefined as string|undefined,
        //
        inheritOptions: {} as InheritOptions,
        widgetOptions: {} as WidgetOptions,
        schemaProperties: [] as string[],
    };

    const state = reactive(initialState);

    const dashboardWidgetInfo = computed<DashboardLayoutWidgetInfo|undefined>(() => {
        if (!state.widgetKey && !state.templateWidgetId) return undefined;
        const _dashboardWidgetInfoList: DashboardLayoutWidgetInfo[] = flattenDeep(dashboardDetailGetters.dashboardWidgetInfoList ?? []);
        const widgetInfoByWidgetKey = _dashboardWidgetInfoList.find((w) => w.widget_key === state.widgetKey);
        const widgetInfoByTemplateWidgetId = _dashboardWidgetInfoList.find((w) => w.template_widget_id === state.templateWidgetId);
        return state.widgetKey ? widgetInfoByWidgetKey : widgetInfoByTemplateWidgetId;
    });
    const dashboardScope = computed<DashboardScope>(() => {
        if (appContextGetters.isAdminMode) return 'DOMAIN';
        return dashboardDetailGetters.dashboardInfo?.resource_group;
    });

    const mergedWidgetState = computed<UnwrapRef<MergedBaseWidgetState>|undefined>(() => {
        if (!state.widgetConfigId) return undefined;
        const merged = mergeBaseWidgetState({
            inheritOptions: dashboardWidgetInfo.value?.inherit_options,
            widgetOptions: dashboardWidgetInfo.value?.widget_options,
            widgetName: state.widgetConfigId,
            dashboardOptions: dashboardDetailState.options,
            dashboardVariablesSchema: dashboardDetailGetters.refinedVariablesSchema,
            dashboardVariables: dashboardDetailState.variables,
            title: dashboardWidgetInfo.value?.title,
            schemaProperties: dashboardWidgetInfo.value?.schema_properties,
        });
        const refined = {
            ...merged,
            widgetConfig: getWidgetConfigByDashboardScope(merged.widgetConfig, dashboardScope.value),
            inheritOptions: getInheritOptionsByDashboardScope(merged.inheritOptions, dashboardScope.value),
            schemaProperties: getSchemaPropertiesByDashboardScope(merged.schemaProperties, dashboardScope.value),
        };
        return refined;
    });

    const getters: UnwrapRef<Getters> = reactive({
        widgetConfig: computed<WidgetConfig|undefined>(() => mergedWidgetState.value?.widgetConfig),
        updatedWidgetInfo: computed<UpdatableWidgetInfo|undefined>(() => {
            if (!getters.widgetConfig || !state.widgetConfigId) {
                return undefined;
            }

            return getUpdatedWidgetInfo(getters.widgetConfig, {
                title: getters.title,
                inherit_options: state.inheritOptions,
                widget_options: state.widgetOptions,
                schema_properties: state.schemaProperties,
            });
        }),
        title,
    });

    return {
        state,
        getters,
    };
});




const getWidgetConfigByDashboardScope = (config: WidgetConfig, dashboardScope: DashboardScope): WidgetConfig => {
    if (dashboardScope === 'PROJECT') {
        const extraOptionsSchema = getWidgetOptionsSchema([['filters.project', { fixed: true, readonly: true }]]);
        return {
            ...config,
            options_schema: {
                properties: { ...(config.options_schema?.properties ?? {}), ...extraOptionsSchema.properties },
                order: ['filters.project', ...(config.options_schema?.order ?? [])],
            },
        };
    }
    return config;
};
const getInheritOptionsByDashboardScope = (inheritOptions: InheritOptions, dashboardScope: DashboardScope): InheritOptions => {
    if (dashboardScope === 'PROJECT') {
        return { ...inheritOptions, 'filters.project': { enabled: true, variable_key: 'project' } };
    }
    return inheritOptions;
};

const getSchemaPropertiesByDashboardScope = (schemaProperties: string[], dashboardScope: DashboardScope): string[] => {
    if (dashboardScope === 'DOMAIN') {
        return union(['filters.workspace'], schemaProperties);
    }
    if (dashboardScope === 'PROJECT') {
        return union(['filters.project'], schemaProperties);
    }
    return schemaProperties;
};

