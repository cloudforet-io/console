import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { useServiceAccountProviderSchema } from '@/services/service-account/composables/use-service-account-provider-schema';
import { getAccountFields, getCustomTableSchemaKey } from '@/services/service-account/helpers/dynamic-ui-schema-generator';
import { getDefaultSearchSchema, getDefaultTableSchema } from '@/services/service-account/helpers/dynamic-ui-schema-generator/dynamic-layout-schema-template';

import type { QuerySearchTableLayout } from '../helpers/dynamic-ui-schema-generator/type';

interface UseAccountTableSchemaParams {
    isTrustedAccount: ComputedRef<boolean>;
}

export const useAccountTableSchema = ({ isTrustedAccount }: UseAccountTableSchemaParams) => {
    const userStore = useUserStore();
    const appConfigStore = useAppContextStore();
    const _isAdminMode = computed(() => appConfigStore.getters.isAdminMode);

    const {
        generalAccountSchema,
        trustedAccountSchema,
    } = useServiceAccountProviderSchema();

    // Fields
    const generalAccountFields = computed<DynamicField[]>(() => {
        if (!generalAccountSchema.value) return [];
        return getAccountFields(generalAccountSchema.value);
    });

    const trustedAccountFields = computed<DynamicField[]>(() => {
        if (!trustedAccountSchema.value) return [];
        return getAccountFields(trustedAccountSchema.value);
    });

    // User Config API
    const { userConfigAPI } = useUserConfigApi();
    const { key: generalAccountKey, params: generalAccountParams } = useServiceQueryKey('config', 'user-config', 'list', {
        params: computed(() => ({
            name: getCustomTableSchemaKey(
                {
                    userType: userStore.state.userType ?? 'USER',
                    userId: userStore.state.userId ?? '',
                },
                'identity.ServiceAccount',
                generalAccountSchema.value?.provider ?? '',
            ),
        })),
    });

    const { key: trustedAccountKey, params: trustedAccountParams } = useServiceQueryKey('config', 'user-config', 'list', {
        params: computed(() => ({
            name: getCustomTableSchemaKey(
                {
                    userType: userStore.state.userType ?? 'USER',
                    userId: userStore.state.userId ?? '',
                },
                'identity.TrustedAccount',
                trustedAccountSchema.value?.provider ?? '',
            ),
        })),
    });

    const { data: generalAccountUserConfigListData, refetch: refetchGeneralAccountUserConfigList } = useScopedQuery({
        queryKey: generalAccountKey,
        queryFn: () => userConfigAPI.list<QuerySearchTableLayout>(generalAccountParams.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 1,
        enabled: computed(() => !!generalAccountSchema.value?.provider && !isTrustedAccount.value),
    }, ['DOMAIN', 'WORKSPACE']);

    const { data: trustedAccountUserConfigListData, refetch: refetchTrustedAccountUserConfigList } = useScopedQuery({
        queryKey: trustedAccountKey,
        queryFn: () => userConfigAPI.list<QuerySearchTableLayout>(trustedAccountParams.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 1,
        enabled: computed(() => !!trustedAccountSchema.value?.provider && isTrustedAccount.value),
    }, ['DOMAIN', 'WORKSPACE']);

    // Custom Schema
    const generalAccountCustomSchema = computed(() => {
        if (!generalAccountUserConfigListData.value) return undefined;
        if (!Object.keys(generalAccountUserConfigListData.value.results?.[0]?.data ?? {}).length) return undefined;
        return generalAccountUserConfigListData.value.results?.[0]?.data;
    });

    const trustedAccountCustomSchema = computed(() => {
        if (!trustedAccountUserConfigListData.value) return undefined;
        if (!Object.keys(trustedAccountUserConfigListData.value.results?.[0]?.data ?? {}).length) return undefined;
        return trustedAccountUserConfigListData.value.results?.[0]?.data;
    });

    // Schema Data
    const generalAccountSchemaData = computed<QuerySearchTableLayout|undefined>(() => {
        const defaultSchema = getDefaultTableSchema(generalAccountFields.value, {
            isTrustedAccount: false,
        });
        const defaultSearchSchema = getDefaultSearchSchema(generalAccountFields.value, false);
        if (!generalAccountCustomSchema.value) {
            defaultSchema.options.search = defaultSearchSchema.search;
            return defaultSchema;
        }
        const _customSchema = { ...generalAccountCustomSchema.value };
        _customSchema.options.search = defaultSearchSchema.search;
        return _customSchema;
    });

    const trustedAccountSchemaData = computed<QuerySearchTableLayout|undefined>(() => {
        const defaultSchema = getDefaultTableSchema(trustedAccountFields.value, {
            isTrustedAccount: true,
            isAdminMode: _isAdminMode.value,
        });
        const defaultSearchSchema = getDefaultSearchSchema(trustedAccountFields.value, true);
        if (!trustedAccountCustomSchema.value) {
            defaultSchema.options.search = defaultSearchSchema.search;
            return defaultSchema;
        }
        const _customSchema = { ...trustedAccountCustomSchema.value };
        _customSchema.options.search = defaultSearchSchema.search;
        return _customSchema;
    });

    return {
        generalAccountTableSchema: computed<QuerySearchTableLayout|undefined>(() => generalAccountSchemaData.value),
        trustedAccountTableSchema: computed<QuerySearchTableLayout|undefined>(() => trustedAccountSchemaData.value),
        refetch: () => {
            if (isTrustedAccount.value) {
                return refetchTrustedAccountUserConfigList();
            }
            return refetchGeneralAccountUserConfigList();
        },
    };
};
