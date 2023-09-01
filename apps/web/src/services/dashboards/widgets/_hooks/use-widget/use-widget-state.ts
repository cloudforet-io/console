import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import { isEmpty } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';


import { store } from '@/store';

import { CURRENCY } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { ASSET_REFERENCE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type {
    WidgetProps,
    WidgetFiltersMap,
} from '@/services/dashboards/widgets/_configs/config';
import type { WidgetBaseState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-base-state';
import {
    useWidgetBaseState,
} from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-base-state';


export interface WidgetState extends WidgetBaseState {
    currency: ComputedRef<Currency|undefined>;
    budgetConsoleFilters: ComputedRef<ConsoleFilter[]>;
    cloudServiceStatsConsoleFilters: ComputedRef<ConsoleFilter[]>;
}
export function useWidgetState(
    props: WidgetProps,
) {
    const baseState = useWidgetBaseState(props);

    return reactive<WidgetState>({
        ...toRefs(baseState) as WidgetBaseState,
        currency: computed(() => {
            if (baseState.settings?.currency.value === 'DEFAULT') return store.state.settings.currency;
            return baseState.settings?.currency.value ?? CURRENCY.USD;
        }),
        budgetConsoleFilters: computed(() => {
            if (!baseState.options?.filters || isEmpty(baseState.options.filters)) return [];
            return getConvertedBudgetConsoleFilters(baseState.options.filters);
        }),
        cloudServiceStatsConsoleFilters: computed(() => {
            if (!baseState.options?.filters || isEmpty(baseState.options.filters)) return [];
            return getConvertedCloudServiceStatsConsoleFilters(baseState.options.filters);
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
        if ((filterKey === ASSET_REFERENCE_TYPE_INFO.asset_compliance_type.type)) {
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
