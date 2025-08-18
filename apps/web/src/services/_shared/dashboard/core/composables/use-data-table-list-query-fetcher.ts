import { useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';


import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';


export const useDataTableListQueryFetcher = () => {
    const { publicDataTableAPI } = usePublicDataTableApi();
    const { privateDataTableAPI } = usePrivateDataTableApi();
    const queryClient = useQueryClient();

    const { withSuffix: withPublicDataTableSuffix } = useServiceQueryKey('dashboard', 'public-data-table', 'list');
    const { withSuffix: withPrivateDataTableSuffix } = useServiceQueryKey('dashboard', 'private-data-table', 'list');


    const fetchDataTableList = async (params: DataTableListParameters): Promise<ListResponse<DataTableModel>> => {
        if (!params.widget_id) {
            throw new Error('widget_id is required');
        }
        const isPrivate = params.widget_id?.startsWith('private');

        const fetcher = isPrivate ? privateDataTableAPI.list : publicDataTableAPI.list;
        const queryKeyWithSuffix = isPrivate ? withPrivateDataTableSuffix : withPublicDataTableSuffix;

        const response = await queryClient.ensureQueryData<ListResponse<DataTableModel>>({
            queryKey: queryKeyWithSuffix([params.widget_id, params]),
            queryFn: () => fetcher(params),
            staleTime: 1000 * 60 * 2,
            gcTime: 1000 * 60 * 3,
        });
        return response;
    };

    return {
        fetchDataTableList,
    };
};
