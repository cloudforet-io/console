import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';


export const useRoleResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { roleAPI } = useRoleApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'role',
        fetchConfig: {
            list: roleAPI.list,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
