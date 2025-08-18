import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useUserGroupApi } from '@/api-clients/identity/user-group/composables/use-user-group-api';
import type { UserGroupListParameters } from '@/api-clients/identity/user-group/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useUserGroupListQuery = ({ params }: { params: ComputedRef<UserGroupListParameters> }) => {
    const { userGroupAPI } = useUserGroupApi();

    const { key: userGroupListQueryKey, params: userGroupListQueryParams } = useServiceQueryKey('identity', 'user-group', 'list', {
        params: computed(() => params.value),
    });

    const { data: userGroupListData, isFetching: userGroupListFetching } = useScopedQuery({
        queryKey: userGroupListQueryKey,
        queryFn: () => userGroupAPI.list(userGroupListQueryParams.value),
        select: (data) => data.results ?? [],
        initialData: {
            results: [],
            total_count: 0,
        },
        gcTime: 1000 * 60 * 2,
        enabled: computed(() => params.value.query?.filter?.[0]?.v?.length > 0),
    }, ['WORKSPACE']);

    return {
        userGroupAPI,
        userGroupListData: computed(() => userGroupListData?.value || []),
        userGroupListFetching,
        userGroupListQueryKey,
    };
};
