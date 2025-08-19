import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseUserConfigListQueryOptions {
    params: ComputedRef<UserConfigListParameters>;
    enabled?: ComputedRef<boolean>;
}



export const useUserConfigListQuery = ({ params, enabled }: UseUserConfigListQueryOptions) => {
    const { userConfigAPI } = useUserConfigApi();

    const { key, params: queryParams } = useServiceQueryKey('config', 'user-config', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => userConfigAPI.list(queryParams.value),
        enabled: computed(() => {
            if (enabled === undefined) {
                return true;
            }
            return enabled.value;
        }),
    }, ['WORKSPACE', 'USER']);
};
