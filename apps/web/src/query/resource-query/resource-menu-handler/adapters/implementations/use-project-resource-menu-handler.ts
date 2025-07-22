import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';


export const useProjectResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { projectAPI } = useProjectApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'project',
        fetchConfig: {
            list: projectAPI.list,
            stat: projectAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
