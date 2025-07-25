import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UserConfigListQueryOptions {
    params: ComputedRef<UserConfigListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useUserConfigListQuery = ({ params, enabled }: UserConfigListQueryOptions) => {
    const { userConfigAPI } = useUserConfigApi();
    const { key } = useServiceQueryKey('config', 'user-config', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => userConfigAPI.list(params.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN']);
};
