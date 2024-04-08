import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { defineStore } from 'pinia';

import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem } from '@/store/reference/provider-reference-store';

import type { BaseInformationForm, CredentialForm } from '@/services/asset-inventory/types/service-account-page-type';


interface Getters {
    autoSyncAdditionalOptionsSchema: ComputedRef<JsonSchema|undefined>;
    selectedProviderItem: ComputedRef<ProviderItem>;
    scheduleHours: ComputedRef<number[]>;
    isAllValidToCreate: ComputedRef<boolean>;
    supportAutoSync: ComputedRef<boolean>;
    isOriginAutoSyncEnabled: ComputedRef<boolean>;
    isMainProvider: ComputedRef<boolean>;
}

interface State {
    selectedProvider: string;
    serviceAccountType: AccountType;
    originServiceAccountItem: Partial<TrustedAccountModel & ServiceAccountModel>; // for detail page
}

interface FormState {
    isBaseInformationFormValid: boolean;
    baseInformation: Partial<BaseInformationForm>;
    isCredentialFormValid: boolean;
    credential: Partial<CredentialForm>;
    isAutoSyncFormValid: boolean;
    isAutoSyncEnabled: boolean;
    additionalOptions: { [key: string]: any };
    selectedSingleWorkspace: string;
    skipProjectGroup: boolean;
    scheduleHours: number[];
}

const MAIN_PROVIDER = ['aws', 'google_cloud', 'azure'];

export const useServiceAccountPageStore = defineStore('page-service-account', () => {
    const allReferenceStore = useAllReferenceStore();

    const state = reactive<State>({
        selectedProvider: '',
        serviceAccountType: ACCOUNT_TYPE.GENERAL,
        originServiceAccountItem: {},
    });

    const formState = reactive<FormState>({
        // baseInformation
        isBaseInformationFormValid: true,
        baseInformation: {},
        // credential
        isCredentialFormValid: true,
        credential: {},
        // autoSync
        isAutoSyncFormValid: true,
        isAutoSyncEnabled: false,
        additionalOptions: {},
        selectedSingleWorkspace: '',
        skipProjectGroup: false,
        scheduleHours: [] as number[],
    });

    const getters = reactive<Getters>({
        selectedProviderItem: computed(() => allReferenceStore.getters.provider[state.selectedProvider]),
        autoSyncAdditionalOptionsSchema: computed(() => getters.selectedProviderItem?.data?.plugin_info?.metadata?.additional_options_schema),
        scheduleHours: computed(() => formState.scheduleHours),
        isAllValidToCreate: computed(() => getters.isAutoSyncFormValid),
        supportAutoSync: computed(() => !!getters.selectedProviderItem?.data?.options?.support_auto_sync),
        isOriginAutoSyncEnabled: computed(() => (state.originServiceAccountItem?.schedule?.state === 'ENABLED')),
        isMainProvider: computed(() => MAIN_PROVIDER.includes(state.selectedProvider ?? '')),
    });
    const actions = {
        initState: () => {
            state.selectedProvider = '';
            formState.baseInformation = {};
            formState.isBaseInformationFormValid = true;
            formState.isAutoSyncFormValid = true;
            formState.isAutoSyncEnabled = false;
            formState.additionalOptions = {};
            formState.selectedSingleWorkspace = '';
            formState.skipProjectGroup = false;
            formState.scheduleHours = [];
        },
        setProvider: (provider: string) => { state.selectedProvider = provider; },
        setFormState: (key:string, data: any) => {
            formState[key] = data;
        },
    };

    watch(() => state.originServiceAccountItem, (item) => {
        if (getters.isOriginAutoSyncEnabled) {
            formState.isAutoSyncEnabled = true;
            formState.scheduleHours = item?.schedule?.hours ?? [];
            formState.selectedSingleWorkspace = item?.sync_options?.single_workspace_id ?? '';
            formState.skipProjectGroup = item?.sync_options?.skip_project_group ?? false;
            formState.additionalOptions = item?.plugin_options ?? {};
        }
    });
    return {
        state,
        formState,
        getters,
        ...actions,
    };
});
