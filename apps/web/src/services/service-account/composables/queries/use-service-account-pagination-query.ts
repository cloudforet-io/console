import { toValue } from '@vueuse/core';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';


interface ServiceAccountPaginationQueryOptions {
    params: ComputedRef<ServiceAccountListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    enabled?: ComputedRef<boolean>;
}

export const useServiceAccountPaginationQuery = ({
    params, thisPage, pageSize, enabled,
}: ServiceAccountPaginationQueryOptions) => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const { key: serviceAccountListQueryKey, params: queryParams } = useServiceQueryKey('identity', 'service-account', 'list', {
        params,
        pagination: true,
    });

    return useScopedPaginationQuery({
        queryKey: serviceAccountListQueryKey,
        queryFn: serviceAccountAPI.list,
        params: queryParams,
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return toValue(enabled);
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);
};
