import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCostReportApi } from '@/api-clients/cost-analysis/cost-report/composables/use-cost-report-api';
import type { CostReportListParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseCostReportListQueryOptions {
    params: ComputedRef<CostReportListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useCostReportListQuery = ({
    params,
    thisPage,
    pageSize,
}: UseCostReportListQueryOptions) => {
    const { costReportAPI } = useCostReportApi();
    const { key, params: queryParams } = useServiceQueryKey('cost-analysis', 'cost-report', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });
    const {
        data, isLoading, totalCount,
    } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: costReportAPI.list,
        params: queryParams,
        enabled: true,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, {
        thisPage: computed(() => thisPage.value),
        pageSize: computed(() => pageSize.value),
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costReportListData: data,
        isLoading,
        totalCount,
    };
};
