import { useProviderApi } from '@/api-clients/identity/provider/composables/use-provider-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';


export const useProviderResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { providerAPI } = useProviderApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'provider',
        fetchConfig: {
            list: providerAPI.list,
            stat: providerAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
