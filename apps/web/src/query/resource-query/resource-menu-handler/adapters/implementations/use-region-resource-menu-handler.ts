import { useRegionApi } from '@/api-clients/inventory/region/composables/use-region-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';



export const useRegionResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { regionAPI } = useRegionApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'region',
        fetchConfig: {
            list: regionAPI.list,
            stat: regionAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
