import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import type { DataTableGetParameters } from '@/api-clients/dashboard/private-data-table/schema/api-verbs/get';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';


const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const GC_TIME = 1000 * 60; // 1 minute

export const useWidgetDataTableQuery = (dataTableId: ComputedRef<string|undefined>) => {
    const { publicDataTableAPI } = usePublicDataTableApi();
    const { privateDataTableAPI } = usePrivateDataTableApi();

    const isPrivate = computed(() => {
        if (!dataTableId.value) return false;
        return dataTableId.value.startsWith('private');
    });

    const { key: publicKey, params: publicParams } = useServiceQueryKey('dashboard', 'public-data-table', 'get', {
        contextKey: dataTableId,
        params: {
            data_table_id: dataTableId.value,
        } as DataTableGetParameters,
    });
    const { key: privateKey, params: privateParams } = useServiceQueryKey('dashboard', 'private-data-table', 'get', {
        contextKey: dataTableId,
        params: {
            data_table_id: dataTableId.value,
        } as DataTableGetParameters,
    });

    const privateDataTableQuery = useScopedQuery({
        queryKey: privateKey,
        queryFn: () => {
            if (!dataTableId.value) {
                throw new Error('DataTable ID is required for fetching data');
            }
            return privateDataTableAPI.get(privateParams.value);
        },
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        enabled: computed(() => !!dataTableId.value && isPrivate.value),
    }, ['WORKSPACE']);
    const publicDataTableQuery = useScopedQuery({
        queryKey: publicKey,
        queryFn: () => {
            if (!dataTableId.value) {
                throw new Error('DataTable ID is required for fetching data');
            }
            return publicDataTableAPI.get(publicParams.value);
        },
        enabled: computed(() => !!dataTableId.value && !isPrivate.value),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    }, ['DOMAIN', 'WORKSPACE']);


    return isPrivate.value ? privateDataTableQuery : publicDataTableQuery;
};
