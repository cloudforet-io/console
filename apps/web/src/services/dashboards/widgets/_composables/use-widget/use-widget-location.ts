import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, isRef, reactive } from 'vue';
import type { Location } from 'vue-router/types/router';

import { flattenDeep } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DateRange } from '@/schema/dashboard/_types/dashboard-type';
import type { WidgetFiltersMap } from '@/schema/dashboard/_types/widget-type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import type { BaseWidgetState } from '@/services/dashboards/widgets/_composables/use-widget/use-base-widget-state';
import type { OverridableWidgetState } from '@/services/dashboards/widgets/_composables/use-widget/use-widget';
import type { WidgetProps } from '@/services/dashboards/widgets/_types/widget-type';

export const useWidgetLocation = (props: WidgetProps, baseState: UnwrapRef<BaseWidgetState>, dateRange: ComputedRef<DateRange>, overrides: OverridableWidgetState = {}) => {
    const assetQueryHelper = new QueryHelper();
    const budgetQueryHelper = new QueryHelper();

    const localState = reactive({
        assetWidgetLocation: computed<Location | undefined>(() => {
            if (Object.hasOwn(overrides, 'assetWidgetLocation')) return isRef(overrides.assetWidgetLocation) ? overrides.assetWidgetLocation.value : overrides.assetWidgetLocation;

            const cloudServiceQuerySetId = baseState.options.cloud_service_query_set;
            if (!cloudServiceQuerySetId) return undefined;
            const cloudServiceQuerySet = props.allReferenceTypeInfo.cloudServiceQuerySet.referenceMap[cloudServiceQuerySetId];
            if (!cloudServiceQuerySet) return undefined;
            const consoleFilters = flattenDeep(Object.values(baseState.options.filters ?? {}));
            return {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: cloudServiceQuerySet.data?.provider,
                    group: cloudServiceQuerySet.data?.cloud_service_group,
                    name: cloudServiceQuerySet.data?.cloud_service_type,
                },
                query: {
                    filters: assetQueryHelper.setFilters(consoleFilters).rawQueryStrings,
                },
            };
        }),
        budgetWidgetLocation: computed<Location | undefined>(() => {
            if (Object.hasOwn(overrides, 'budgetWidgetLocation')) return isRef(overrides.budgetWidgetLocation) ? overrides.budgetWidgetLocation.value : overrides.budgetWidgetLocation;

            budgetQueryHelper.setFilters([]);
            const dataSourceId = baseState.options.cost_data_source;
            if (dataSourceId) budgetQueryHelper.addFilter({ k: 'data_source_id', v: [dataSourceId], o: '=' });
            if (baseState.options.filters?.provider) budgetQueryHelper.addFilter(...baseState.options.filters.provider);
            return {
                name: COST_EXPLORER_ROUTE.BUDGET._NAME,
                params: {},
                query: {
                    filters: budgetQueryHelper.rawQueryStrings,
                },
            };
        }),
        costWidgetLocation: computed<Location | undefined>(() => {
            if (Object.hasOwn(overrides, 'costWidgetLocation')) return isRef(overrides.costWidgetLocation) ? overrides.costWidgetLocation.value : overrides.costWidgetLocation;

            const dataField: string[] = [];
            if (baseState.dataField) dataField.push(baseState.dataField);
            if (baseState.secondaryDataField) dataField.push(baseState.secondaryDataField);
            const location: Location = {
                name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                params: {
                    dataSourceId: baseState.options.cost_data_source ?? '',
                    costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
                },
                query: {
                    granularity: primitiveToQueryString(baseState.granularity),
                    group_by: arrayToQueryString(dataField),
                    period: objectToQueryString(dateRange.value),
                    filters: arrayToQueryString(getWidgetLocationFilters(baseState.options.filters)),
                },
            };
            return location;
        }),
    });

    const widgetLocation = computed<Location|undefined>(() => {
        if (baseState.widgetConfig.labels?.includes('Budget')) return localState.budgetWidgetLocation;
        if (baseState.widgetConfig.labels?.includes('Asset')) return localState.assetWidgetLocation;
        if (baseState.widgetConfig.labels?.includes('Cost')) return localState.costWidgetLocation;
        return undefined;
    });

    return Object.hasOwn(overrides, 'widgetLocation') ? overrides.widgetLocation : widgetLocation;
};


/**
 * @name getWidgetLocationFilters
 * @param widgetFilters
 * @example { provider: [{k: 'provider', v: ['aws', 'google'], o: '='}] }
 * => [{k: 'provider', v: ['aws', 'google'], o: '='}, {k: 'product', v: ['AWSELB'], o: '='}]
 */
export const getWidgetLocationFilters = (widgetFilters?: WidgetFiltersMap): ConsoleFilter[] => {
    const consoleFilters: ConsoleFilter[] = [];
    Object.values(widgetFilters ?? {}).forEach((filterItems) => {
        consoleFilters.push(...filterItems);
    });
    return consoleFilters;
};
