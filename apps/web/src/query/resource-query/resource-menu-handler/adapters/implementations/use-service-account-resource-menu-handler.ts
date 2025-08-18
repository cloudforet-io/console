import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';



export const useServiceAccountResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'serviceAccount',
        fetchConfig: {
            list: serviceAccountAPI.list,
            stat: serviceAccountAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
