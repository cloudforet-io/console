import type { ComputedRef } from 'vue';
import { computed, reactive, ref } from 'vue';

import { defineStore } from 'pinia';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProviderModel } from '@/schema/identity/provider/model';
import type { SchemaListParameters } from '@/schema/identity/schema/api-verbs/list';
import type { SchemaModel } from '@/schema/identity/schema/model';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { ReferenceItem } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface Getters {
    tableSchema?: any;
    currentProviderSchemaList: ComputedRef<SchemaModel[]>;
    currentProviderData: ComputedRef<ProviderModel|ReferenceItem<undefined>>;
    generalAccountSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    trustedAccountSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    trustingSecretSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    secretSchema: ComputedRef<Partial<SchemaModel>|undefined>;
}

// description: The JSON Schema required for the service account is defined for each provider.
// The JSON Schema defined for each provider is used to configure the DynamicLayout on the client side.
export const useServiceAccountSchemaStore = defineStore('service-account-schema', () => {
    const _providerSchemaMap = ref<Record<string, SchemaModel[]>>({});
    const _providerItemMap = computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']);

    const state = reactive({
        currentProvider: undefined as string|undefined,
    });

    const getters = reactive<Getters>({
        // tableSchema: computed(() => ({})), // need converting
        currentProviderSchemaList: computed(() => _providerSchemaMap.value[state.currentProvider ?? ''] ?? []),
        currentProviderData: computed(() => _providerItemMap.value[state.currentProvider ?? '']),
        generalAccountSchema: computed(() => getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'SERVICE_ACCOUNT')),
        trustedAccountSchema: computed(() => getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'TRUSTED_ACCOUNT')),
        trustingSecretSchema: computed(() => getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'TRUSTING_SECRET')),
        secretSchema: computed(() => getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'SECRET')),
    });

    const actions = {
        setProviderSchema: async (provider: string) => {
            if (!_providerSchemaMap.value[provider]) {
                try {
                    const res = await SpaceConnector.clientV2.identity.schema.list<SchemaListParameters, ListResponse<SchemaModel>>({
                        domainId: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
                        provider,
                        workspace_id: undefined,
                    });
                    _providerSchemaMap.value[provider] = res?.results ?? [];
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            }
            state.currentProvider = provider;
        },
    };

    return {
        _providerSchemaMap,
        state,
        getters,
        ...actions,
    };
});
