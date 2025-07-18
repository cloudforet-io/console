import { useNamespaceApi } from '@/api-clients/inventory/namespace/composables/use-namespace-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';



export const useNamespaceResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { namespaceAPI } = useNamespaceApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'namespace',
        fetchConfig: {
            list: namespaceAPI.list,
            stat: namespaceAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
