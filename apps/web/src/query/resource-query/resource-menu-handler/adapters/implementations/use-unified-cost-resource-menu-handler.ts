import { useUnifiedCostApi } from '@/api-clients/cost-analysis/unified-cost/composables/use-unified-cost-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';



export const useUnifiedCostResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { unifiedCostAPI } = useUnifiedCostApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'unifiedCost',
        fetchConfig: {
            list: unifiedCostAPI.list,
            stat: unifiedCostAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
