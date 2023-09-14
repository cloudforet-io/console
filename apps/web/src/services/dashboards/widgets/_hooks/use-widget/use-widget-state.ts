import type { ComputedRef, Ref, UnwrapRef } from 'vue';
import {
    computed, reactive, toRef, toRefs,
} from 'vue';

import dayjs from 'dayjs';
import { flattenDeep, isEmpty } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { CURRENCY } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { ASSET_VARIABLE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { DateRange } from '@/services/dashboards/config';
import type {
    WidgetProps,
    WidgetFiltersMap,

    AssetGroupBy,
    CostGroupBy,
    Granularity,
    WidgetFilter,
} from '@/services/dashboards/widgets/_configs/config';
import {
    GRANULARITY,
} from '@/services/dashboards/widgets/_configs/config';
import type { MergedWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-merged-widget-state';
import {
    useMergedWidgetState,
} from '@/services/dashboards/widgets/_hooks/use-widget/use-merged-widget-state';
import type { ChartType } from '@/services/dashboards/widgets/type';


export interface WidgetState extends MergedWidgetState {
    granularity: ComputedRef<Granularity|undefined>;
    chartType: ComputedRef<ChartType|undefined>;
    groupBy: ComputedRef<CostGroupBy | AssetGroupBy | undefined>;
    dateRange: ComputedRef<DateRange>;
    currency: Ref<Currency|undefined>;
    // filters
    consoleFilters: ComputedRef<ConsoleFilter[]>;
    budgetConsoleFilters: ComputedRef<ConsoleFilter[]>;
    cloudServiceStatsConsoleFilters: ComputedRef<ConsoleFilter[]>;
}
export function useWidgetState(props: WidgetProps) {
    const state = useMergedWidgetState({
        inheritOptions: toRef(props, 'inheritOptions'),
        widgetOptions: toRef(props, 'options'),
        widgetName: toRef(props, 'widgetConfigId'),
        dashboardSettings: toRef(props, 'dashboardSettings'),
        dashboardVariablesSchema: toRef(props, 'dashboardVariablesSchema'),
        dashboardVariables: toRef(props, 'dashboardVariables'),
    });

    return reactive<WidgetState>({
        ...toRefs(state) as MergedWidgetState,
        granularity: computed(() => state.options?.granularity),
        chartType: computed<ChartType|undefined>(() => state.options?.chart_type),
        groupBy: computed(() => {
            if (state.widgetConfig.labels?.includes('Cost')) return state.options?.cost_group_by;
            if (state.widgetConfig.labels?.includes('Asset')) return state.options?.asset_group_by;
            return undefined;
        }),
        dateRange: computed<DateRange>(() => {
            const dateRangeFormat = state.options.granularity === GRANULARITY.YEARLY ? 'YYYY' : 'YYYY-MM';
            const end = dayjs.utc(state.settings?.date_range?.end).format(dateRangeFormat);
            const start = dayjs.utc(state.settings?.date_range?.start).format(dateRangeFormat);
            return { start, end };
        }),
        currency: computed<Currency|undefined>(() => {
            const dataSources = props.allReferenceTypeInfo.cost_data_source.referenceMap;
            if (state.widgetConfig.labels?.includes('Cost')) {
                if (!state.options?.cost_data_source) return CURRENCY.USD;
                return dataSources[state.options.cost_data_source]?.data?.plugin_info?.metadata?.currency;
            }
            return undefined;
        }),
        // filters
        consoleFilters: computed<WidgetFilter[]>(() => {
            if (!state.options?.filters || isEmpty(state.options.filters)) return [];
            return flattenDeep<WidgetFilter[]>(Object.values(state.options.filters));
        }),
        budgetConsoleFilters: computed(() => {
            if (!state.options?.filters || isEmpty(state.options.filters)) return [];
            return getConvertedBudgetConsoleFilters(state.options.filters);
        }),
        cloudServiceStatsConsoleFilters: computed(() => {
            if (!state.options?.filters || isEmpty(state.options.filters)) return [];
            return getConvertedCloudServiceStatsConsoleFilters(state.options.filters);
        }),
    }) as UnwrapRef<WidgetState>;
}

const getConvertedBudgetConsoleFilters = (widgetFiltersMap: WidgetFiltersMap): ConsoleFilter[] => {
    const results: ConsoleFilter[] = [];
    Object.entries(widgetFiltersMap).forEach(([filterKey, filterItems]) => {
        if (!filterItems?.length) return;
        if ((filterKey === REFERENCE_TYPE_INFO.project.type || filterKey === REFERENCE_TYPE_INFO.project_group.type)) {
            filterItems.forEach((d) => {
                results.push(d);
            });
        } else {
            filterItems.forEach((d) => {
                const value = Array.isArray(d.v) ? d.v : [d.v];
                results.push({
                    k: `cost_types.${d.k}`,
                    v: [null, ...value],
                    o: d.o,
                });
            });
        }
    });
    return results;
};


const getConvertedCloudServiceStatsConsoleFilters = (widgetFiltersMap: WidgetFiltersMap): ConsoleFilter[] => {
    const results: ConsoleFilter[] = [];
    Object.entries(widgetFiltersMap).forEach(([filterKey, filterItems]) => {
        if (!filterItems?.length) return;
        // HACK: This is temporary code for cloud_service_type filter
        if ((filterKey === ASSET_VARIABLE_TYPE_INFO.asset_compliance_type.type)) {
            filterItems.forEach((d) => {
                const key = 'cloud_service_type';
                results.push({
                    k: key,
                    v: d.v,
                    o: d.o,
                });
            });
        } else {
            filterItems.forEach((d) => {
                results.push(d);
            });
        }
    });
    return results;
};
