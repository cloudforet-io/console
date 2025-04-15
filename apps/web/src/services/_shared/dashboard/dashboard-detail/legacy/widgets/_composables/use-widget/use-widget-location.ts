import type { ComputedRef, UnwrapRef } from 'vue';
import { computed, isRef, reactive } from 'vue';
import type { Location } from 'vue-router/types/router';

import { flattenDeep } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';

import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';


import type { BaseWidgetState } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-base-widget-state';
import type { OverridableWidgetState } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { getWidgetLocationFilters } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-location-helper';
import type { WidgetProps } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { CloudServiceDetailPageUrlQuery } from '@/services/asset-inventory/types/cloud-service-page-type';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


export const useWidgetLocation = (props: WidgetProps, baseState: UnwrapRef<BaseWidgetState>, dateRange: ComputedRef<DateRange>, overrides: OverridableWidgetState = {}) => {
    const assetQueryHelper = new QueryHelper();
    const budgetQueryHelper = new QueryHelper();
    const appContextStore = useAppContextStore();

    const localState = reactive({
        assetWidgetLocation: computed<Location | undefined>(() => {
            if (Object.hasOwn(overrides, 'assetWidgetLocation')) return isRef(overrides.assetWidgetLocation) ? overrides.assetWidgetLocation.value : overrides.assetWidgetLocation;

            const cloudServiceQuerySetId = baseState.options.cloud_service_query_set;
            if (!cloudServiceQuerySetId) return undefined;
            const cloudServiceQuerySet = props.allReferenceTypeInfo.cloud_service_query_set.referenceMap[cloudServiceQuerySetId];
            if (!cloudServiceQuerySet) return undefined;
            const consoleFilters = flattenDeep(Object.values(baseState.options.filters ?? {}));
            const query: CloudServiceDetailPageUrlQuery = {
                filters: assetQueryHelper.setFilters(consoleFilters).rawQueryStrings,
            };
            const cloudServiceDetailRouteName = appContextStore.getters.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME;
            return {
                name: cloudServiceDetailRouteName,
                params: {
                    provider: cloudServiceQuerySet.data?.provider,
                    group: cloudServiceQuerySet.data?.cloud_service_group,
                    name: cloudServiceQuerySet.data?.cloud_service_type,
                },
                query,
            };
        }),
        budgetWidgetLocation: computed<Location | undefined>(() => {
            if (Object.hasOwn(overrides, 'budgetWidgetLocation')) return isRef(overrides.budgetWidgetLocation) ? overrides.budgetWidgetLocation.value : overrides.budgetWidgetLocation;

            budgetQueryHelper.setFilters([]);
            const dataSourceId = baseState.options.cost_data_source;
            if (dataSourceId) budgetQueryHelper.addFilter({ k: 'data_source_id', v: [dataSourceId], o: '=' });
            if (baseState.options.filters?.provider) budgetQueryHelper.addFilter(...baseState.options.filters.provider);
            const adminBudgetRouteName = appContextStore.getters.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.BUDGET._NAME : COST_EXPLORER_ROUTE.BUDGET._NAME;
            return {
                name: adminBudgetRouteName,
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
            const costQuerySetRouteName = appContextStore.getters.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME;
            return {
                name: costQuerySetRouteName,
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
