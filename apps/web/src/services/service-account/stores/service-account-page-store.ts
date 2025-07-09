import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import type { IdentityJobModel } from '@/api-clients/identity/job/schema/model';
import type { IdentityJobStatus } from '@/api-clients/identity/job/schema/type';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import type { BaseInformationForm, CredentialForm } from '@/services/service-account/types/service-account-page-type';


interface Getters {
    scheduleHours: ComputedRef<number[]>;
    isAllValidToCreate: ComputedRef<boolean>;
    isMainProvider: ComputedRef<boolean>;
    lastSuccessSynced: ComputedRef<string>;
    lastJob: ComputedRef<IdentityJobModel>;
    secondToLastJob: ComputedRef<Partial<IdentityJobModel>>;
    lastJobStatus: ComputedRef<IdentityJobStatus>;
    autoSyncDocsLink: ComputedRef<string>;
    isTrustedAccount: ComputedRef<boolean>;
}

interface State {
    selectedProvider: string;
    serviceAccountType: AccountType;
    originServiceAccountItem: Partial<TrustedAccountModel & ServiceAccountModel> | undefined; // for detail page
    syncJobList: IdentityJobModel[];
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
    const appContextStore = useAppContextStore();
    const userStore = useUserStore();

    const _storeState = reactive({
        language: computed(() => userStore.state.language),
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });

    const state = reactive<State>({
        selectedProvider: '',
        serviceAccountType: ACCOUNT_TYPE.GENERAL,
        originServiceAccountItem: {},
        syncJobList: [],
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
        scheduleHours: computed(() => formState.scheduleHours),
        isAllValidToCreate: computed(() => getters.isAutoSyncFormValid),
        isMainProvider: computed(() => MAIN_PROVIDER.includes(state.selectedProvider ?? '')),
        lastSuccessSynced: computed(() => state.syncJobList.find((job) => job.status === 'SUCCESS')?.finished_at ?? ''),
        lastJob: computed(() => state.syncJobList[0]),
        secondToLastJob: computed(() => state.syncJobList.find((job) => ['SUCCESS', 'FAILURE'].includes(job.status)) ?? {}),
        lastJobStatus: computed(() => state.syncJobList[0]?.status),
        autoSyncDocsLink: computed(() => {
            const language = _storeState.language === 'ko' ? 'ko/' : '';
            if (_storeState.isAdminMode) {
                return `https://cloudforet.io/${language}docs/guides/admin-mode/service-account/`;
            }
            return `https://cloudforet.io/${language}docs/guides/asset-inventory/service-account/`;
        }),
        isTrustedAccount: computed(() => state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    });

    const mutations = {
        setOriginServiceAccountItem: (item: Partial<TrustedAccountModel & ServiceAccountModel>) => {
            state.originServiceAccountItem = item;
        },
        setServiceAccountType: (type: AccountType) => {
            state.serviceAccountType = type;
        },
    };
    const actions = {
        initState: () => {
            state.selectedProvider = '';
            state.originServiceAccountItem = {};
            formState.baseInformation = {};
            formState.isBaseInformationFormValid = true;
            formState.isAutoSyncFormValid = true;
            formState.isAutoSyncEnabled = false;
            formState.additionalOptions = {};
            formState.selectedSingleWorkspace = '';
            formState.skipProjectGroup = false;
            formState.scheduleHours = [];
            state.syncJobList = [];
        },
        initToOriginServiceAccountItem: () => {
            formState.isAutoSyncEnabled = state.originServiceAccountItem?.schedule?.state === 'ENABLED';
            formState.scheduleHours = state.originServiceAccountItem?.schedule?.hours ?? [];
            formState.selectedSingleWorkspace = state.originServiceAccountItem?.sync_options?.single_workspace_id ?? '';
            formState.skipProjectGroup = state.originServiceAccountItem?.sync_options?.skip_project_group ?? false;
            formState.additionalOptions = state.originServiceAccountItem?.plugin_options ?? {};
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
        } else {
            formState.isAutoSyncEnabled = false;
            formState.scheduleHours = [];
            formState.selectedSingleWorkspace = '';
            formState.skipProjectGroup = false;
            formState.additionalOptions = {};
        }
    });
    return {
        state,
        formState,
        getters,
        ...mutations,
        ...actions,
    };
});
