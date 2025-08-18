import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';


export const useAppResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { appAPI } = useAppApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'app',
        fetchConfig: {
            list: appAPI.list,
            stat: appAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
