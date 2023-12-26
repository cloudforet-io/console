import type { ComputedRef } from 'vue';
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import { defineStore } from 'pinia';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProviderModel } from '@/schema/identity/provider/model';
import type { SchemaListParameters } from '@/schema/identity/schema/api-verbs/list';
import type { SchemaModel } from '@/schema/identity/schema/model';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { ReferenceItem } from '@/store/modules/reference/type';
import type { UserState } from '@/store/modules/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getDetailSchema, getServiceAccountTableSchema } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator';

interface Getters {
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
    const _userConfigMap = computed<UserState>(() => store.state.user);

    const state = reactive({
        currentProvider: undefined as string|undefined,
        generalAccountTableSchema: undefined as DynamicLayout|undefined,
        trustedAccountTableSchema: undefined as DynamicLayout|undefined,
        generalAccountDetailSchema: undefined as { details: Partial<DynamicLayout>[] }|undefined,
        trustedAccountDetailSchema: undefined as { details: Partial<DynamicLayout>[] }|undefined,
    });

    const getters = reactive<Getters>({
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
                        provider,
                    });
                    _providerSchemaMap.value[provider] = res?.results ?? [];
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            }
            state.currentProvider = provider;
        },
        setGeneralAccountTableSchema: async (provider: string) => {
            state.generalAccountTableSchema = await getServiceAccountTableSchema({
                resourceType: 'identity.ServiceAccount',
                options: {
                    provider,
                },
                userData: {
                    userType: _userConfigMap.value.userType ?? 'USER',
                    userId: _userConfigMap.value.userId ?? '',
                },
            });
        },
        setTrustedAccountTableSchema: async (provider: string) => {
            state.trustedAccountTableSchema = await getServiceAccountTableSchema({
                resourceType: 'identity.TrustedAccount',
                options: {
                    provider,
                },
                userData: {
                    userType: _userConfigMap.value.userType ?? 'USER',
                    userId: _userConfigMap.value.userId ?? '',
                },
            });
        },
        setGeneralAccountDetailSchema: async (provider: string) => {
            state.generalAccountDetailSchema = await getDetailSchema({ resourceType: 'identity.ServiceAccount', options: { provider } });
        },
        setTrustedAccountDetailSchema: async (provider: string) => {
            state.trustedAccountDetailSchema = await getDetailSchema({ resourceType: 'identity.TrustedAccount', options: { provider } });
        },
    };

    watch(() => state.currentProvider, async (provider) => {
        if (provider) {
            await Promise.allSettled([
                actions.setGeneralAccountTableSchema(provider),
                actions.setTrustedAccountTableSchema(provider),
                actions.setGeneralAccountDetailSchema(provider),
                actions.setTrustedAccountDetailSchema(provider),
            ]);
        }
    });

    return {
        state,
        getters,
        ...actions,
    };
});
