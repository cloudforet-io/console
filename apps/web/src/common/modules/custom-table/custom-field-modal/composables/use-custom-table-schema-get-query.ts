import { computed, type ComputedRef } from 'vue';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { getCustomTableSchemaKey } from '@/common/modules/custom-table/custom-field-modal/utils/custom-table-schema-helpers';

import type { ResourceType, QuerySearchTableLayout } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';



interface UseCustomTableSchemaGetQueryOptions {
    userData: ComputedRef<{ userType: string, userId: string }>;
    resourceType: ComputedRef<ResourceType|undefined>;
    provider: ComputedRef<string|undefined>;
    enabled?: ComputedRef<boolean>;
}

export const useCustomTableSchemaGetQuery = ({
    userData, resourceType, provider, enabled,
}: UseCustomTableSchemaGetQueryOptions) => {
    const { userConfigAPI } = useUserConfigApi();
    const { key, params } = useServiceQueryKey('config', 'user-config', 'list', {
        params: computed(() => ({ name: getCustomTableSchemaKey(userData.value, resourceType.value, provider.value) })),
    });

    return useScopedQuery<ListResponse<UserConfigModel<QuerySearchTableLayout>>, unknown, QuerySearchTableLayout | undefined>({
        queryKey: key,
        queryFn: () => userConfigAPI.list<QuerySearchTableLayout>(params.value),
        select: (data) => {
            if (!data?.results) return undefined;
            const userConfig = data.results[0];
            if (Object.keys(userConfig?.data ?? {}).length === 0) return undefined;
            return userConfig?.data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => !!userData.value.userType && !!userData.value.userId && !!resourceType.value && !!provider.value && (enabled?.value ?? true)),
    }, ['DOMAIN', 'WORKSPACE']);
};
