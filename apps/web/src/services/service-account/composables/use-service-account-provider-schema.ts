import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';

import { useServiceAccountSchemaListQuery } from '@/services/service-account/composables/queries/use-service-account-schema-list-query';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';

interface UseServiceAccountProviderSchemaOptions {
    provider?: ComputedRef<string>;
}

export const useServiceAccountProviderSchema = ({ provider }: UseServiceAccountProviderSchemaOptions = {}) => {
    const serviceAccountSchemaStore = useServiceAccountSchemaStore();
    const currentProvider = computed(() => serviceAccountSchemaStore.state.currentProvider);

    const { data } = useServiceAccountSchemaListQuery({
        params: computed(() => ({
            provider: provider?.value ?? currentProvider.value,
        })),
        enabled: computed(() => !!(provider?.value ?? currentProvider.value)),
    });

    return {
        currentProviderSchemaList: computed<SchemaModel[]>(() => data.value ?? []),
        generalAccountSchema: computed<SchemaModel|undefined>(() => (data.value ?? []).find((schema) => schema.schema_type === 'SERVICE_ACCOUNT')),
        trustedAccountSchema: computed<SchemaModel|undefined>(() => (data.value ?? []).find((schema) => schema.schema_type === 'TRUSTED_ACCOUNT')),
        trustingSecretSchemaList: computed<SchemaModel[]>(() => (data.value ?? []).filter((schema) => schema.schema_type === 'TRUSTING_SECRET')),
        secretSchema: computed<SchemaModel|undefined>(() => (data.value ?? []).find((schema) => schema.schema_type === 'SECRET')),
        isCachedProviderSchema: computed<boolean>(() => !!data.value),
    };
};
