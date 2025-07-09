import { toValue } from '@vueuse/core';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useTrustedAccountApi } from '@/api-clients/identity/trusted-account/composables/use-trusted-account-api';
import type { TrustedAccountListParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';


interface TrustedAccountPaginationQueryOptions {
    params: ComputedRef<TrustedAccountListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    enabled?: ComputedRef<boolean>;
}

export const useTrustedAccountPaginationQuery = ({
    params, thisPage, pageSize, enabled,
}: TrustedAccountPaginationQueryOptions) => {
    const { trustedAccountAPI } = useTrustedAccountApi();
    const { key: trustedAccountListQueryKey, params: queryParams } = useServiceQueryKey('identity', 'trusted-account', 'list', {
        params,
        pagination: true,
    });

    return useScopedPaginationQuery({
        queryKey: trustedAccountListQueryKey,
        queryFn: trustedAccountAPI.list,
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
