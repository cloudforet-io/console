import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, isRef, reactive } from 'vue';

import { flattenDeep, isEmpty } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { WidgetFiltersMap } from '@/schema/dashboard/_types/widget-type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { BaseWidgetState } from '@/services/dashboards/widgets/_composables/use-widget/use-base-widget-state';
import type { OverridableWidgetState } from '@/services/dashboards/widgets/_composables/use-widget/use-widget';
import type { WidgetProps } from '@/services/dashboards/widgets/_types/widget-type';

export const useWidgetConsoleFilters = (props: WidgetProps, widgetState: UnwrapRef<BaseWidgetState>, overrides: OverridableWidgetState = {}): ComputedRef<ConsoleFilter[]> => {
    const queryHelper = new QueryHelper();
    const localState = reactive({
        budgetConsoleFilters: computed<ConsoleFilter[]>(() => {
            if (overrides.budgetConsoleFilters) return isRef(overrides.budgetConsoleFilters) ? overrides.budgetConsoleFilters.value : overrides.budgetConsoleFilters;
            if (!widgetState.options?.filters || isEmpty(widgetState.options.filters)) return [];
            return getConvertedBudgetConsoleFilters(widgetState.options.filters);
        }),
        cloudServiceAnalyzeConsoleFilters: computed<ConsoleFilter[]>(() => {
            if (overrides.cloudServiceAnalyzeConsoleFilters) {
                return isRef(overrides.cloudServiceAnalyzeConsoleFilters) ? overrides.cloudServiceAnalyzeConsoleFilters.value : overrides.cloudServiceAnalyzeConsoleFilters;
            }
            // set filters from cloud service query set
            const cloudServiceQuerySetId = widgetState.options.cloud_service_query_set;
            if (cloudServiceQuerySetId) {
                const cloudServiceQuerySet = props.allReferenceTypeInfo.cloudServiceQuerySet.referenceMap[cloudServiceQuerySetId];
                queryHelper.setFilters([
                    { k: 'provider', v: cloudServiceQuerySet.data?.provider, o: '=' },
                    { k: 'cloud_service_group', v: cloudServiceQuerySet.data?.cloud_service_group, o: '=' },
                    { k: 'cloud_service_type', v: cloudServiceQuerySet.data?.cloud_service_type, o: '=' },
                ]);
            }
            return [
                ...flattenDeep(Object.values(widgetState.options.filters ?? {})),
                ...queryHelper.filters,
            ];
        }),
    });

    const consoleFilters = computed<ConsoleFilter[]>(() => {
        if (widgetState.widgetConfig.labels?.includes('Budget')) {
            return localState.budgetConsoleFilters;
        }
        if (widgetState.widgetConfig.labels?.includes('Asset') && widgetState.options.data_criteria === 'realtime') {
            return localState.cloudServiceAnalyzeConsoleFilters;
        }
        if (!widgetState.options?.filters || isEmpty(widgetState.options.filters)) return [];
        return flattenDeep<ConsoleFilter[]>(Object.values(widgetState.options.filters));
    });

    return overrides.consoleFilters ? overrides.consoleFilters : consoleFilters;
};



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
