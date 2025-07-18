import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';


export const useWorkspaceResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { workspaceAPI } = useWorkspaceApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'workspace',
        fetchConfig: {
            list: workspaceAPI.list,
        },
    });

    return {
        getHandler: getResourceMenuHandler,
    };
};
