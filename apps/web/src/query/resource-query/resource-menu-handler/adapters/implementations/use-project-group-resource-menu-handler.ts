import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';


export const useProjectGroupResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { projectGroupAPI } = useProjectGroupApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'projectGroup',
        fetchConfig: {
            list: projectGroupAPI.list,
            stat: projectGroupAPI.stat,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
