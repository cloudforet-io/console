import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import type { ConfigData } from '@/common/modules/user-config/shared/use-convert-referenced-config-data';


interface UseFavoriteConfigDataQueryOptions {
    configDataType: 'console:favorite' | 'console:favorite:WORKSPACE';
    params: ComputedRef<UserConfigListParameters>;
    enabled?: ComputedRef<boolean>;
}



export const useFavoriteConfigDataQuery = ({ configDataType = 'console:favorite', params, enabled }: UseFavoriteConfigDataQueryOptions) => {
    const { userConfigAPI } = useUserConfigApi();

    const { key, params: queryParams } = useServiceQueryKey('config', 'user-config', 'list', {
        contextKey: configDataType,
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => userConfigAPI.list<ConfigData>(queryParams.value),
        enabled: computed(() => {
            if (enabled === undefined) {
                return true;
            }
            return enabled.value;
        }),
    }, ['WORKSPACE', 'USER']);
};
