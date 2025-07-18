import { useMetricApi } from '@/api-clients/inventory/metric/composables/use-metric-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';



export const useMetricResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { metricAPI } = useMetricApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'metric',
        fetchConfig: {
            list: metricAPI.list,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
