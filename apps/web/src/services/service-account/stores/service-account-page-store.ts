import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostReportConfigListParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/list';
import type { CostReportConfigModel } from '@/api-clients/cost-analysis/cost-report-config/schema/model';
import type { IdentityJobListParameters } from '@/api-clients/identity/job/schema/api-verbs/list';
import type { IdentityJobModel } from '@/api-clients/identity/job/schema/model';
import type { IdentityJobStatus } from '@/api-clients/identity/job/schema/type';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { Currency } from '@/store/display/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem } from '@/store/reference/provider-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BaseInformationForm, CredentialForm } from '@/services/service-account/types/service-account-page-type';


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
    currency: ComputedRef<Currency|undefined>;
    isTrustedAccount: ComputedRef<boolean>;
}

interface State {
    selectedProvider: string;
    serviceAccountType: AccountType;
    originServiceAccountItem: Partial<TrustedAccountModel & ServiceAccountModel>; // for detail page
    syncJobList: IdentityJobModel[];
    costReportConfig: CostReportConfigModel|null|undefined,
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
        costReportConfig: null,
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
        currency: computed(() => state.costReportConfig?.currency),
        isTrustedAccount: computed(() => state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    });
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
            state.costReportConfig = null;
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
        fetchCostReportConfig: async () => {
            if (state.costReportConfig !== null) return;
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>();
                state.costReportConfig = results?.[0];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.costReportConfig = undefined;
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
