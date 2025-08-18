import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';


export const useCostDataSourceResourceMenuHandler = (): UseResourceMenuHandlerReturnType => {
    const { dataSourceAPI } = useDataSourceApi();
    const { getResourceMenuHandler } = useBaseResourceMenuHandler({
        resourceType: 'costDataSource',
        fetchConfig: {
            list: dataSourceAPI.list,
        },
    });

    return { getHandler: getResourceMenuHandler };
};
