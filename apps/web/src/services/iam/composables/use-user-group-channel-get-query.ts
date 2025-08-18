

import { computed } from 'vue';

import { useUserGroupChannelApi } from '@/api-clients/alert-manager/user-group-channel/composables/use-user-group-channel-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

export const useUserGroupChannelGetQuery = () => {
    const userGroupPageStore = useUserGroupPageStore();
    const userGroupPageGetters = userGroupPageStore.getters;
    const selectedChannelId = computed(() => userGroupPageGetters.selectedUserGroupChannel?.[0]?.channel_id);

    const { key: userGroupChannelGetQueryKey, params: userGroupChannelGetQueryParams } = useServiceQueryKey('alert-manager', 'user-group-channel', 'get', {
        contextKey: computed(() => selectedChannelId.value),
        params: computed(() => ({
            channel_id: selectedChannelId.value ?? '',
        })),
    });

    const { userGroupChannelAPI } = useUserGroupChannelApi();

    const { data: userGroupChannelData, isFetching: isUserGroupChannelFetching } = useScopedQuery({
        queryKey: userGroupChannelGetQueryKey,
        queryFn: () => userGroupChannelAPI.get(userGroupChannelGetQueryParams.value),
        enabled: computed(() => !!selectedChannelId.value),
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        userGroupChannelData,
        isUserGroupChannelFetching,
        userGroupChannelGetQueryKey,
        userGroupChannelGetQueryParams,
    } as const;
};
