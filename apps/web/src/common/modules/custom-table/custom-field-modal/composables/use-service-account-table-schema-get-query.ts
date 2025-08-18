import { computed, type ComputedRef } from 'vue';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useSchemaApi } from '@/api-clients/identity/schema/composables/use-schema-api';
import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


import type { ResourceType, GetSchemaParams } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';


interface UseServiceAccountTableSchemaGetQueryOptions {
    options: ComputedRef<GetSchemaParams['options']>;
    resourceType: ComputedRef<ResourceType|undefined>;
    enabled?: ComputedRef<boolean>;
}

export const useServiceAccountTableSchemaGetQuery = ({ options, resourceType, enabled }: UseServiceAccountTableSchemaGetQueryOptions) => {
    const { schemaAPI } = useSchemaApi();
    const { key, params } = useServiceQueryKey('identity', 'schema', 'list', {
        params: computed(() => ({ provider: options.value?.provider })),
    });

    const isTrustedAccount = computed(() => resourceType.value === 'identity.TrustedAccount');

    return useScopedQuery<ListResponse<SchemaModel>, unknown, SchemaModel | undefined>({
        queryKey: key,
        queryFn: () => schemaAPI.list(params.value),
        select: (data) => (data?.results || []).find((schema) => schema.schema_type === (isTrustedAccount.value ? 'TRUSTED_ACCOUNT' : 'SERVICE_ACCOUNT')),
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => !!options.value?.provider && (enabled?.value ?? true)),
    }, ['DOMAIN', 'WORKSPACE']);
};
