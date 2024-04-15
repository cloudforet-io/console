import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { IdentityJobListParameters } from '@/schema/identity/job/api-verbs/list';
import type { IdentityJobModel } from '@/schema/identity/job/model';
import type { IdentityJobStatus } from '@/schema/identity/job/type';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem } from '@/store/reference/provider-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BaseInformationForm, CredentialForm } from '@/services/asset-inventory/types/service-account-page-type';


interface Getters {
    autoSyncAdditionalOptionsSchema: ComputedRef<JsonSchema|undefined>;
    selectedProviderItem: ComputedRef<ProviderItem>;
    scheduleHours: ComputedRef<number[]>;
    isAllValidToCreate: ComputedRef<boolean>;
    supportAutoSync: ComputedRef<boolean>;
    isOriginAutoSyncEnabled: ComputedRef<boolean>;
    isMainProvider: ComputedRef<boolean>;
    lastSuccessSynced: ComputedRef<string>;
    lastJob: ComputedRef<IdentityJobModel>;
    secondToLastJob: ComputedRef<Partial<IdentityJobModel>>;
    lastJobStatus: ComputedRef<IdentityJobStatus>;
    autoSyncDocsLink: ComputedRef<string>;
}

interface State {
    selectedProvider: string;
    serviceAccountType: AccountType;
    originServiceAccountItem: Partial<TrustedAccountModel & ServiceAccountModel>; // for detail page
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
    const allReferenceStore = useAllReferenceStore();
    const appContextStore = useAppContextStore();

    const _storeState = reactive({
        language: computed(() => store.state.user.language),
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
        selectedProviderItem: computed(() => allReferenceStore.getters.provider[state.selectedProvider]),
        autoSyncAdditionalOptionsSchema: computed(() => getters.selectedProviderItem?.data?.plugin_info?.metadata?.additional_options_schema),
        scheduleHours: computed(() => formState.scheduleHours),
        isAllValidToCreate: computed(() => getters.isAutoSyncFormValid),
        supportAutoSync: computed(() => !!getters.selectedProviderItem?.data?.options?.support_auto_sync),
        isOriginAutoSyncEnabled: computed(() => (state.originServiceAccountItem?.schedule?.state === 'ENABLED')),
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
        fetchSyncJobList: async (trustedAccountId: string) => {
            try {
                // fetch recent job
                const { results } = await SpaceConnector.clientV2.identity.job.list<IdentityJobListParameters, ListResponse<IdentityJobModel>>({
                    trusted_account_id: trustedAccountId,
                });
                state.syncJobList = results ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.syncJobList = [];
            }
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
        ...actions,
    };
});
