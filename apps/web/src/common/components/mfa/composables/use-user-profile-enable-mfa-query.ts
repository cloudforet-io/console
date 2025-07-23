import type { ComputedRef } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useUserProfileApi } from '@/api-clients/identity/user-profile/composables/use-user-profile-api';
import type { UserProfileEnableMfaParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/enable-mfa';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UserUserProfileEnableMfaQueryOptions {
    params: ComputedRef<UserProfileEnableMfaParameters>;
}

export const useUserProfileEnableMfaQuery = ({
    params,
}: UserUserProfileEnableMfaQueryOptions) => {
    const { userProfileAPI } = useUserProfileApi();
    const { key, params: queryParams } = useServiceQueryKey('identity', 'user-profile', 'enable-mfa', {
        params,
    });

    return useQuery({
        queryKey: key,
        queryFn: () => userProfileAPI.enableMfa(queryParams.value),
        enabled: true,
    });
};
