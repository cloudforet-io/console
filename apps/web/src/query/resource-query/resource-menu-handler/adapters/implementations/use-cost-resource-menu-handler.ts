import { useCostApi } from '@/api-clients/cost-analysis/cost/composables/use-cost-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';



export const useCostResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { costAPI } = useCostApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'cost',
        fetchConfig: {
            stat: costAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
