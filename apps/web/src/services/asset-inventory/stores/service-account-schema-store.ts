import type { ComputedRef } from 'vue';
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { DynamicField } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import { defineStore } from 'pinia';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProviderModel } from '@/schema/identity/provider/model';
import type { SchemaListParameters } from '@/schema/identity/schema/api-verbs/list';
import type { SchemaModel } from '@/schema/identity/schema/model';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { AccountType } from '@/schema/identity/service-account/type';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { ReferenceItem } from '@/store/modules/reference/type';
import type { UserState } from '@/store/modules/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getAccountFields, getCustomTableSchema } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator';
import { getDefaultDetailSchema, getDefaultSearchSchema, getDefaultTableSchema } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator/dynamic-layout-schema-template';

interface Getters {
    currentProviderSchemaList: ComputedRef<SchemaModel[]>;
    currentProviderData: ComputedRef<ProviderModel|ReferenceItem<undefined>>;
    generalAccountSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    trustedAccountSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    trustingSecretSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    secretSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    isSupportTrustedAccount: ComputedRef<boolean>;
    isCachedProviderSchema: ComputedRef<boolean>;
}

// description: The JSON Schema required for the service account is defined for each provider.
// The JSON Schema defined for each provider is used to configure the DynamicLayout on the client side.
export const useServiceAccountSchemaStore = defineStore('service-account-schema', () => {
    const _providerSchemaMap = ref<Record<string, SchemaModel[]>>({});
    const _providerItemMap = computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']);
    const _userConfigMap = computed<UserState>(() => store.state.user);

    const state = reactive({
        selectedAccountType: ACCOUNT_TYPE.GENERAL as AccountType,
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
        isSupportTrustedAccount: computed(() => {
            const currentProviderData:ProviderModel = getters.currentProviderData;
            return currentProviderData?.options?.support_trusted_account ?? false;
        }),
        isCachedProviderSchema: computed(() => !!_providerSchemaMap.value[state.currentProvider ?? '']),
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
        setGeneralAccountTableSchema: async () => {
            const accountSchema = getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'SERVICE_ACCOUNT');
            const fields:DynamicField[] = getAccountFields(accountSchema);
            let schemaData = getDefaultTableSchema(fields, false);
            const userData = {
                userType: _userConfigMap.value.userType ?? 'USER',
                userId: _userConfigMap.value.userId ?? '',
            };

            const customSchemaData = accountSchema?.provider ? await getCustomTableSchema(userData, 'identity.ServiceAccount', accountSchema?.provider) : undefined;
            if (customSchemaData) schemaData = customSchemaData;

            const searchSchemaData = getDefaultSearchSchema(fields, false);
            if (schemaData.options) schemaData.options.search = searchSchemaData.search;
            state.generalAccountTableSchema = schemaData;
        },
        setTrustedAccountTableSchema: async () => {
            const accountSchema = getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'TRUSTED_ACCOUNT');
            const fields:DynamicField[] = getAccountFields(accountSchema);
            let schemaData = getDefaultTableSchema(fields, true);
            const userData = {
                userType: _userConfigMap.value.userType ?? 'USER',
                userId: _userConfigMap.value.userId ?? '',
            };

            const customSchemaData = accountSchema?.provider ? await getCustomTableSchema(userData, 'identity.TrustedAccount', accountSchema?.provider) : undefined;
            if (customSchemaData) schemaData = customSchemaData;

            const searchSchemaData = getDefaultSearchSchema(fields, true);
            if (schemaData.options) schemaData.options.search = searchSchemaData.search;

            state.trustedAccountTableSchema = schemaData;
        },
        setGeneralAccountDetailSchema: async () => {
            const accountSchema = getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'SERVICE_ACCOUNT');
            const fields:DynamicField[] = getAccountFields(accountSchema);
            state.generalAccountDetailSchema = getDefaultDetailSchema(fields, false);
        },
        setTrustedAccountDetailSchema: async () => {
            const accountSchema = getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'SERVICE_ACCOUNT');
            const fields:DynamicField[] = getAccountFields(accountSchema);
            state.trustedAccountDetailSchema = getDefaultDetailSchema(fields, true);
        },
    };

    watch(() => state.currentProvider, async (provider) => {
        if (provider) {
            await Promise.allSettled([
                actions.setGeneralAccountTableSchema(),
                actions.setTrustedAccountTableSchema(),
                actions.setGeneralAccountDetailSchema(),
                actions.setTrustedAccountDetailSchema(),
            ]);
        }
    });

    return {
        state,
        getters,
        ...actions,
    };
});
