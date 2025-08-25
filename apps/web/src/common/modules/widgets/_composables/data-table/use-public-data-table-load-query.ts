import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/load';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { WIDGET_LOAD_GC_TIME, WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';

interface UsePublicDataTableLoadQueryOptions {
    dataTableId: ComputedRef<string|undefined>;
    params: ComputedRef<DataTableLoadParameters>;
}

export const usePublicDataTableLoadQuery = (options: UsePublicDataTableLoadQueryOptions) => {
    const {
        dataTableId,
        params,
    } = options;

    const { publicDataTableAPI } = usePublicDataTableApi();

    const { key: publicDataTableLoadQueryKey, params: publicDataTableLoadParams } = useServiceQueryKey('dashboard', 'public-data-table', 'load', {
        contextKey: computed(() => dataTableId.value),
        params,
    });

    return useScopedQuery({
        queryKey: publicDataTableLoadQueryKey,
        queryFn: () => {
            if (!dataTableId.value) {
                throw new Error('Selected data table id is undefined');
            }
            return publicDataTableAPI.load(publicDataTableLoadParams.value);
        },
        enabled: computed(() => dataTableId.value !== undefined && !dataTableId.value.startsWith('private')),
        staleTime: WIDGET_LOAD_STALE_TIME,
        gcTime: WIDGET_LOAD_GC_TIME,
        retry: 2,
    }, ['WORKSPACE', 'DOMAIN']);
};
