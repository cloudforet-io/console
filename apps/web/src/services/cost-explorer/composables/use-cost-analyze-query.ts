import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { isEmpty } from 'lodash';

import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';

import { useCostApi } from '@/api-clients/cost-analysis/cost/composables/use-cost-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useCostAnalyzeQuery = ({
    data_source_id,
    query,
}: {
    data_source_id: ComputedRef<string>;
    query: ComputedRef<AnalyzeQuery>;
}) => {
    const { costAPI } = useCostApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'cost', 'analyze', {
        params: computed(() => ({
            data_source_id: data_source_id.value,
            query: query.value,
        })),
    });

    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => costAPI.analyze(params.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
        enabled: computed(() => !!data_source_id.value && !isEmpty(query.value)), // 조건부 활성화
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costAnalyzeData: data, isLoading, error,
    };
};
