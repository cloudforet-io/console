import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useSecretApi } from '@/api-clients/secret/secret/composables/use-secret-api';
import type { SecretListParameters } from '@/api-clients/secret/secret/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseSecretPaginationQueryOptions {
    params: ComputedRef<SecretListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    enabled?: ComputedRef<boolean>;
}

export const useSecretPaginationQuery = ({
    params, thisPage, pageSize, enabled,
}: UseSecretPaginationQueryOptions) => {
    const { secretAPI } = useSecretApi();

    const { key, params: queryParams } = useServiceQueryKey('secret', 'secret', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data, isLoading, totalCount, query,
    } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: secretAPI.list,
        params: queryParams,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
        enabled: computed(() => enabled?.value ?? true),
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data,
        isLoading,
        totalCount,
        refetch: query.refetch,
    };
};
