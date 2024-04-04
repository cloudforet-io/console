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


interface Getters {
    autoSyncAdditionalOptionsSchema: ComputedRef<JsonSchema|undefined>;
    selectedProviderItem: ComputedRef<ProviderItem>;
    scheduleHours: ComputedRef<number[]>;
    isAllValidToCreate: ComputedRef<boolean>;
    supportAutoSync: ComputedRef<boolean>;
}

interface State {
    selectedProvider: string;
    serviceAccountType: AccountType;
    serviceAccountItem: Partial<TrustedAccountModel & ServiceAccountModel>; // for detail page
}
export const useServiceAccountPageStore = defineStore('page-service-account', () => {
    const allReferenceStore = useAllReferenceStore();

    const state = reactive<State>({
        selectedProvider: '',
        serviceAccountType: ACCOUNT_TYPE.GENERAL,
        serviceAccountItem: {},
    });

    const formState = reactive({
        // autoSync
        isAutoSyncFormValid: true,
        isAutoSyncEnabled: false,
        additionalOptions: {},
        selectedSingleWorkspace: '',
        skipProjectGroup: true,
        scheduleHours: [] as number[],
    });

    const getters = reactive<Getters>({
        selectedProviderItem: computed(() => allReferenceStore.getters.provider[state.selectedProvider]),
        autoSyncAdditionalOptionsSchema: computed(() => getters.selectedProviderItem?.data?.plugin_info?.metadata?.additional_options_schema),
        scheduleHours: computed(() => formState.scheduleHours),
        isAllValidToCreate: computed(() => getters.isAutoSyncFormValid),
        supportAutoSync: computed(() => !!getters.selectedProviderItem?.data?.options?.support_auto_sync),
    });
    const actions = {
        initState: () => {
            state.selectedProvider = '';
            formState.isAutoSyncFormValid = true;
            formState.isAutoSyncEnabled = false;
            formState.additionalOptions = {};
            formState.selectedSingleWorkspace = '';
            formState.skipProjectGroup = true;
            formState.scheduleHours = [];
        },
        setProvider: (provider: string) => { state.selectedProvider = provider; },
        setFormState: (key:string, data: any) => {
            formState[key] = data;
        },
    };

    watch(() => state.serviceAccountItem, (item) => {
        if (item?.schedule || item?.sync_options || item?.plugin_options) {
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
