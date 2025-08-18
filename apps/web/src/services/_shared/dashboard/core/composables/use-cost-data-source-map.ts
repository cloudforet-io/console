import { computed, reactive } from 'vue';


import { useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';


export const useCostDataSourceMap = () => {
    const { dataSourceAPI } = useDataSourceApi();
    const queryClient = useQueryClient();

    const { key, params } = useServiceQueryKey('cost-analysis', 'data-source', 'list', {
        params: computed(() => ({
            query: {
                only: ['data_source_id', 'name', 'plugin_info', 'cost_additional_info_keys', 'cost_tag_keys', 'workspace_id', 'cost_data_keys', 'permissions'],
            },
        })),
    });

    const costDataSourceMap = reactive<Record<string, CostDataSourceModel>>({});


    const getCostDataSourceMap = async (): Promise<Record<string, CostDataSourceModel>> => {
        const response = await queryClient.ensureQueryData<ListResponse<CostDataSourceModel>>({
            queryKey: key,
            queryFn: () => dataSourceAPI.list(params.value),
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
        });

        response.results?.forEach((item) => {
            if (costDataSourceMap[item.data_source_id]) return;
            costDataSourceMap[item.data_source_id] = item;
        });

        return costDataSourceMap;
    };

    return {
        getCostDataSourceMap,
    };
};
