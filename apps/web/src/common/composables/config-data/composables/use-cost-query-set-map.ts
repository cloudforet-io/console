import {
    reactive, watch, readonly, ref,
    computed,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useCostQuerySetApi } from '@/api-clients/cost-analysis/cost-query-set/composables/use-cost-query-set-api';
import type { CostQuerySetModel } from '@/api-clients/cost-analysis/cost-query-set/schema/model';
import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useCostQuerySetMap = () => {
    const queryClient = useQueryClient();
    const { dataSourceAPI } = useDataSourceApi();
    const { costQuerySetAPI } = useCostQuerySetApi();
    const loading = ref(false);

    const { key: dataSourceKey, params: dataSourceParams } = useServiceQueryKey('cost-analysis', 'data-source', 'list', {
        params: {
            query: {
                only: ['data_source_id'],
            },
        },
    });
    const { withSuffix } = useServiceQueryKey('cost-analysis', 'cost-query-set', 'list', {
        params: {
            query: {
                only: ['cost_query_set_id', 'name', 'data_source_id'],
            },
        },
    });

    const { data: dataSourceIds, isFetching: isFetchingDataSourceIds } = useScopedQuery({
        queryKey: dataSourceKey,
        queryFn: () => dataSourceAPI.list(dataSourceParams.value),
        select: (data) => (data.results || []).map((d) => d.data_source_id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['WORKSPACE']);

    const staticQueryParams = {
        query: {
            only: ['cost_query_set_id', 'name', 'data_source_id'],
        },
    };
    const costQuerySetFetcher = async (dataSourceId: string) => {
        const costQuerySetParams = {
            data_source_id: dataSourceId,
            ...staticQueryParams,
        };
        const response = await queryClient.ensureQueryData<ListResponse<CostQuerySetModel>>({
            queryKey: withSuffix([dataSourceId, costQuerySetParams]),
            queryFn: () => costQuerySetAPI.list(costQuerySetParams),
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
        });

        return response.results || [];
    };

    const costQuerySetMap = reactive<Record<string, CostQuerySetModel>>({});


    watch(dataSourceIds, async () => {
        if (!dataSourceIds.value?.length) return;
        loading.value = true;
        const promises = dataSourceIds.value.map((dataSourceId) => costQuerySetFetcher(dataSourceId));
        const results = await Promise.all(promises);
        results.forEach((data) => {
            data.forEach((d) => {
                costQuerySetMap[d.cost_query_set_id] = d;
            });
        });
        loading.value = false;
    });

    return {
        map: readonly(costQuerySetMap),
        loading: computed(() => loading.value || isFetchingDataSourceIds.value),
    };
};
