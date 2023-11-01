import type { ComputedRef, Ref, UnwrapRef } from 'vue';
import {
    computed, reactive, toRef, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import dayjs from 'dayjs';
import { flattenDeep, isEmpty } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { CURRENCY } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type {
    WidgetProps,
    WidgetFiltersMap,

    AssetGroupBy,
    CostGroupBy,
    Granularity,
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
    cloudServiceAnalyzeConsoleFilters: ComputedRef<ConsoleFilter[]>;
    // location
    assetWidgetLocation: ComputedRef<Location|null>;
}
const queryHelper = new QueryHelper();
export function useWidgetState(props: WidgetProps) {
    const state = useMergedWidgetState({
        inheritOptions: toRef(props, 'inheritOptions'),
        widgetOptions: toRef(props, 'options'),
        widgetName: toRef(props, 'widgetConfigId'),
        dashboardSettings: toRef(props, 'dashboardSettings'),
        dashboardVariablesSchema: toRef(props, 'dashboardVariablesSchema'),
        dashboardVariables: toRef(props, 'dashboardVariables'),
        title: toRef(props, 'title'),
        schemaProperties: toRef(props, 'schemaProperties'),
    });

    return reactive<WidgetState>({
        ...toRefs(state) as MergedWidgetState,
        granularity: computed(() => state.options?.granularity),
        chartType: computed<ChartType|undefined>(() => state.options?.chart_type),
        groupBy: computed(() => {
            if (state.widgetConfig.labels?.includes('Cost')) return state.options?.cost_data_field;
            if (state.widgetConfig.labels?.includes('Asset')) return state.options?.asset_data_field;
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
        consoleFilters: computed<ConsoleFilter[]>(() => {
            if (!state.options?.filters || isEmpty(state.options.filters)) return [];
            return flattenDeep<ConsoleFilter[]>(Object.values(state.options.filters));
        }),
        budgetConsoleFilters: computed<ConsoleFilter[]>(() => {
            if (!state.options?.filters || isEmpty(state.options.filters)) return [];
            return getConvertedBudgetConsoleFilters(state.options.filters);
        }),
        cloudServiceAnalyzeConsoleFilters: computed<ConsoleFilter[]>(() => {
            // set filters from asset query set
            const assetQuerySetId = state.options.asset_query_set;
            if (assetQuerySetId) {
                const assetQuerySet = props.allReferenceTypeInfo.assetQuerySet.referenceMap[assetQuerySetId];
                queryHelper.setFilters([
                    { k: 'provider', v: assetQuerySet.data?.provider, o: '=' },
                    { k: 'cloud_service_group', v: assetQuerySet.data?.cloud_service_group, o: '=' },
                    { k: 'cloud_service_type', v: assetQuerySet.data?.cloud_service_type, o: '=' },
                ]);
            }
            return [
                ...flattenDeep(Object.values(state.options.filters ?? {})),
                ...queryHelper.filters,
            ];
        }),
        // location
        assetWidgetLocation: computed<Location|null>(() => {
            const assetQuerySetId = state.options.asset_query_set;
            if (!assetQuerySetId) return null;
            const assetQuerySet = props.allReferenceTypeInfo.assetQuerySet.referenceMap[assetQuerySetId];
            const consoleFilters = flattenDeep(Object.values(state.options.filters ?? {}));
            return {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: assetQuerySet.data?.provider,
                    group: assetQuerySet.data?.cloud_service_group,
                    name: assetQuerySet.data?.cloud_service_type,
                },
                query: {
                    filters: queryHelper.setFilters(consoleFilters).rawQueryStrings,
                },
            };
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
                    k: d.k,
                    v: value,
                    o: d.o,
                });
            });
        }
    });
    return results;
};
