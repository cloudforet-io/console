import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { SchemaListParameters } from '@/schema/identity/schema/api-verbs/list';
import type { SchemaModel } from '@/schema/identity/schema/model';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

// description: The JSON Schema required for the service account is defined for each provider.
// The JSON Schema defined for each provider is used to configure the DynamicLayout on the client side.
export const useServiceAccountSchemaStore = defineStore('service-account-schema', () => {
    const state = reactive({
        providerSchemaMap: {},
        currentProviderSchema: {},
        providerMap: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    });

    const actions = {
        async setProviderSchema(provider: string) {
            if (!state.providerSchemaMap[provider]) {
                try {
                    const res = await SpaceConnector.clientV2.identity.schema.list<SchemaListParameters, ListResponse<SchemaModel>>({
                        domainId: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
                        provider,
                        workspace_id: undefined,
                    });
                    state.providerSchemaMap[provider] = res?.results ?? [];
                    state.currentProviderSchema = state.providerSchemaMap[provider] ?? [];
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            }
        },
    };

    (async () => {
        if (Object.keys(state.providerMap).length === 0) {
            await store.dispatch('reference/fetchProviderItems');
        }
    })();

    return {
        state,
        ...actions,
    };
});
