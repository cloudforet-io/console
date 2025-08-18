
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { ROLE_STATE } from '@/api-clients/identity/role/constant';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useWorkspaceGroupRoleListQuery = () => {
    const { roleAPI } = useRoleApi();

    const roleListApiQueryHelper = new ApiQueryHelper().setFilters([{ k: 'state', v: ROLE_STATE.ENABLED, o: '=' }]);

    const { key: roleListQueryKey, params } = useServiceQueryKey('identity', 'role', 'list', {
        params: {
            query: roleListApiQueryHelper.data,
        },
    });

    return useScopedQuery({
        queryKey: roleListQueryKey,
        queryFn: () => roleAPI.list(params.value),
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
        enabled: true,
    }, ['DOMAIN']);
};
