import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import { isEmpty } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { ASSET_REFERENCE_TYPE_INFO } from '@/lib/reference/asset-reference-config';

import type {
    WidgetProps,
    WidgetFiltersMap,
    AssetGroupBy,
} from '@/services/dashboards/widgets/_configs/config';
import type { WidgetBaseState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-base-state';
import {
    useWidgetBaseState,
} from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-base-state';

export interface AssetWidgetState extends WidgetBaseState {
    groupBy: ComputedRef<AssetGroupBy | undefined>;
    cloudServiceStatsConsoleFilters: ComputedRef<ConsoleFilter[]>;
}
export function useAssetWidgetState(
    props: WidgetProps,
) {
    const baseState = useWidgetBaseState(props);

    return reactive<AssetWidgetState>({
        ...toRefs(baseState) as WidgetBaseState,
        groupBy: computed(() => baseState.options?.asset_group_by as AssetGroupBy|undefined),
        cloudServiceStatsConsoleFilters: computed(() => {
            if (!baseState.options?.filters || isEmpty(baseState.options.filters)) return [];
            return getConvertedCloudServiceStatsConsoleFilters(baseState.options.filters);
        }),
    }) as UnwrapRef<AssetWidgetState>;
}

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
