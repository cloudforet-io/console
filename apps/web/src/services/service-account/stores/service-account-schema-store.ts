import type { ComputedRef } from 'vue';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProviderModel } from '@/api-clients/identity/provider/schema/model';
import type { SchemaListParameters } from '@/api-clients/identity/schema/schema/api-verbs/list';
import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem, ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getAccountFields, getCustomTableSchema } from '@/services/service-account/helpers/dynamic-ui-schema-generator';
import { getDefaultDetailSchema, getDefaultSearchSchema, getDefaultTableSchema } from '@/services/service-account/helpers/dynamic-ui-schema-generator/dynamic-layout-schema-template';
import type { ItemLayout, QuerySearchTableLayout } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';


interface Getters {
    currentProviderSchemaList: ComputedRef<SchemaModel[]>;
    currentProviderData: ComputedRef<ProviderItem>|undefined;
    generalAccountSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    trustedAccountSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    trustingSecretSchemaList: ComputedRef<Partial<SchemaModel>|undefined>;
    secretSchema: ComputedRef<Partial<SchemaModel>|undefined>;
    isSupportTrustedAccount: ComputedRef<boolean>;
    isCachedProviderSchema: ComputedRef<boolean>;
}

// description: The JSON Schema required for the service account is defined for each provider.
// The JSON Schema defined for each provider is used to configure the DynamicLayout on the client side.
export const useServiceAccountSchemaStore = defineStore('service-account-schema', () => {
    const allReferenceStore = useAllReferenceStore();
    const appContextStore = useAppContextStore();
    const userStore = useUserStore();
    const _providerSchemaMap = ref<Record<string, SchemaModel[]>>({});
    const _providerItemMap = computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider);
    const _isAdminMode = computed(() => appContextStore.getters.isAdminMode);

    const state = reactive({
        selectedAccountType: ACCOUNT_TYPE.GENERAL as AccountType,
        currentProvider: undefined as string|undefined,
        generalAccountTableSchema: undefined as QuerySearchTableLayout|undefined,
        trustedAccountTableSchema: undefined as QuerySearchTableLayout|undefined,
        generalAccountDetailSchema: undefined as ItemLayout|undefined,
        trustedAccountDetailSchema: undefined as ItemLayout|undefined,
    });

    const getters = reactive<Getters>({
        currentProviderSchemaList: computed(() => _providerSchemaMap.value[state.currentProvider ?? ''] ?? []),
        currentProviderData: computed(() => _providerItemMap.value[state.currentProvider ?? '']),
        generalAccountSchema: computed(() => getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'SERVICE_ACCOUNT')),
        trustedAccountSchema: computed(() => getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'TRUSTED_ACCOUNT')),
        trustingSecretSchemaList: computed(() => getters.currentProviderSchemaList.filter((schema) => schema.schema_type === 'TRUSTING_SECRET')),
        secretSchema: computed(() => getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'SECRET')),
        isSupportTrustedAccount: computed(() => {
            const currentProviderData:ProviderModel = getters.currentProviderData?.data;
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
            let schemaData = getDefaultTableSchema(fields, {
                isTrustedAccount: false,
            });
            const userData = {
                userType: userStore.state.userType ?? 'USER',
                userId: userStore.state.userId ?? '',
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
            let schemaData = getDefaultTableSchema(fields, {
                isTrustedAccount: true,
                isAdminMode: _isAdminMode.value,
            });
            const userData = {
                userType: userStore.state.userType ?? 'USER',
                userId: userStore.state.userId ?? '',
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
            state.generalAccountDetailSchema = getDefaultDetailSchema(fields, { isTrustedAccount: false });
        },
        setTrustedAccountDetailSchema: async () => {
            const accountSchema = getters.currentProviderSchemaList.find((schema) => schema.schema_type === 'TRUSTED_ACCOUNT');
            const fields:DynamicField[] = getAccountFields(accountSchema);
            state.trustedAccountDetailSchema = getDefaultDetailSchema(fields, { isTrustedAccount: true, isAdminMode: _isAdminMode.value });
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
