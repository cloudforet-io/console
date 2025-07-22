import { useMetricDataApi } from '@/api-clients/inventory/metric-data/composables/use-metric-data-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';



export const useMetricDataResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { metricDataAPI } = useMetricDataApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'metricData',
        fetchConfig: {
            list: metricDataAPI.list,
            stat: metricDataAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
