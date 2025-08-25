import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/load';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { WIDGET_LOAD_GC_TIME, WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';

interface UsePrivateDataTableLoadQueryOptions {
    dataTableId: ComputedRef<string|undefined>;
    params: ComputedRef<DataTableLoadParameters>;
}

export const usePrivateDataTableLoadQuery = (options: UsePrivateDataTableLoadQueryOptions) => {
    const {
        dataTableId,
        params,
    } = options;

    const { privateDataTableAPI } = usePrivateDataTableApi();

    const isPrivate = computed(() => !!dataTableId?.value?.startsWith('private'));

    const { key: privateDataTableLoadQueryKey, params: privateDataTableLoadParams } = useServiceQueryKey('dashboard', 'private-data-table', 'load', {
        contextKey: computed(() => dataTableId.value),
        params,
    });

    return useScopedQuery({
        queryKey: privateDataTableLoadQueryKey,
        queryFn: () => {
            if (!dataTableId.value) {
                throw new Error('Selected data table id is undefined');
            }
            return privateDataTableAPI.load(privateDataTableLoadParams.value);
        },
        enabled: computed(() => dataTableId.value !== undefined && isPrivate.value),
        staleTime: WIDGET_LOAD_STALE_TIME,
        gcTime: WIDGET_LOAD_GC_TIME,
        retry: 2,
    }, ['WORKSPACE', 'DOMAIN']);
};
