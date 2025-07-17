<script setup lang="ts">
import {
    computed, reactive, ref,
} from 'vue';

import dayjs from 'dayjs';

import { getThisPage } from '@cloudforet/core-lib/component-util/pagination';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PPaneLayout,
    PHeading,
    PDataTable,
    PLink,
    PToolbox,
    PButton,
    PI,
    PButtonModal,
    PCodeEditor,
    PTooltip,
    PStatus,
    PDivider,
    PSelectStatus, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';


import { SERVICE_ACCOUNT_STATE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { green, red } from '@/styles/colors';

import { useTrustedAccountSyncMutation } from '@/services/service-account/composables/mutations/use-trusted-account-sync-mutation';
import { useServiceAccountJobListQuery } from '@/services/service-account/composables/queries/use-service-account-job-list-query';
import { useServiceAccountPaginationQuery } from '@/services/service-account/composables/queries/use-service-account-pagination-query';
import { useServiceAccountDetail } from '@/services/service-account/composables/use-service-account-detail';
import { useServiceAccountProviderSchema } from '@/services/service-account/composables/use-service-account-provider-schema';
import { getAccountFields, stateFormatter } from '@/services/service-account/helpers/dynamic-ui-schema-generator';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';



const props = withDefaults(defineProps<{
    serviceAccountId: string;
    attachedGeneralAccounts: ServiceAccountModel[];
    hasReadWriteAccess?: boolean;
}>(), {
    serviceAccountId: undefined,
    attachedGeneralAccounts: () => ([]),
});

const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const userStore = useUserStore();

const { getReferenceLocation } = useReferenceRouter();

const referenceMap = useAllReferenceDataModel();

const {
    serviceAccountData,
} = useServiceAccountDetail({
    serviceAccountId: computed(() => props.serviceAccountId),
});

const { generalAccountSchema } = useServiceAccountProviderSchema();

const state = reactive({
    isOriginAutoSyncEnabled: computed(() => (serviceAccountData.value as TrustedAccountModel|undefined)?.schedule?.state === 'ENABLED'),
    isSyncEnabled: computed(() => {
        const isDomainScope = (serviceAccountData.value as TrustedAccountModel|undefined)?.resource_group === 'DOMAIN';
        const isAdminMode = appContextStore.getters.isAdminMode;
        if (isDomainScope) {
            return isAdminMode;
        }
        return state.isOriginAutoSyncEnabled;
    }),
    trustedAccountId: computed<string|undefined>(() => (serviceAccountData.value as TrustedAccountModel|undefined)?.trusted_account_id),
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    lastSuccessSynced: computed(() => (syncJobList.value ?? []).find((job) => job.status === 'SUCCESS')?.finished_at ?? ''),
    errorModalVisible: false,
    isSyncing: computed(() => ['IN_PROGRESS', 'PENDING'].includes(syncJobList.value?.[0]?.status ?? '')),
    lastSyncJob: computed(() => {
        if (state.isSyncing) {
            return syncJobList.value?.find((job) => ['SUCCESS', 'FAILURE'].includes(job.status)) ?? {};
        }
        return syncJobList.value?.[0] ?? {};
    }),
    fields: computed<DataTableFieldType[]>(() => {
        const generalAccountField = getAccountFields(generalAccountSchema.value);
        return [
            { name: 'name', label: 'Account Name' },
            ...generalAccountField.map((field) => ({
                label: field.name,
                name: field.key,
                type: 'text',
            })),
            { name: 'state', label: 'State', sortable: false },
            { name: 'workspace_id', label: 'Workspace', sortable: false },
            { name: 'project_id', label: 'Project', sortable: false },
            { name: 'last_synced_at', label: 'Last Synced', sortable: false },
            { name: 'created_at', label: 'Created', sortable: false },
        ];
    }),
    typeField: computed<ValueItem[]>(() => ([
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALL') as string, name: 'ALL' },
        { label: i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.ACTIVE') as string, name: SERVICE_ACCOUNT_STATE.ACTIVE },
        // { label: i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.INACTIVE') as string, name: SERVICE_ACCOUNT_STATE.INACTIVE },
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.PENDING') as string, name: SERVICE_ACCOUNT_STATE.PENDING },
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.DELETE') as string, name: SERVICE_ACCOUNT_STATE.DELETED },
    ])),
    selectedType: 'ALL',
});

const { data: syncJobList, refetch: refetchSyncJobList } = useServiceAccountJobListQuery({
    params: computed(() => ({
        trusted_account_id: props.serviceAccountId,
    })),
    refetchInterval: (query) => {
        const lastJob = query.data?.value?.results?.[0];
        if (['IN_PROGRESS', 'PENDING'].includes(lastJob?.status ?? '')) return 10000;
        return false;
    },
    enabled: computed(() => !!props.serviceAccountId),
});


const paginationOptions = reactive({
    sortBy: 'created_at',
    sortDesc: true,
    pageStart: 1,
    pageLimit: 15,
});
const apiQueryHelper = new ApiQueryHelper().setSort(paginationOptions.sortBy, paginationOptions.sortDesc).setPageLimit(paginationOptions.pageLimit).setFilters([
    { k: 'trusted_account_id', v: props.serviceAccountId, o: '=' }]);
const apiQuery = ref(apiQueryHelper.data);

const {
    totalCount, data: attachedGeneralAccountsData, isLoading, query: attachedGeneralAccountsQuery,
} = useServiceAccountPaginationQuery({
    params: computed(() => ({
        query: apiQuery.value,
    })),
    thisPage: computed(() => getThisPage(paginationOptions.pageStart, paginationOptions.pageLimit)),
    pageSize: computed(() => paginationOptions.pageLimit),
});

const { mutate: syncTrustedAccount, isPending: isSyncing } = useTrustedAccountSyncMutation({
    onSuccess: () => {
        showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.START_SYNC'), '');
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        if (state.trustedAccountId) refetchSyncJobList();
    },
});

const getProjectDetailLocation = (id: string) => getReferenceLocation(id, { resource_type: 'identity.Project' });
const handleChange = async (options?: ToolboxOptions) => {
    await userWorkspaceStore.load();
    const convertOptions = {
        ...options,
        sortBy: paginationOptions.sortBy,
        sortDesc: paginationOptions.sortDesc,
    };
    apiQuery.value = getApiQueryWithToolboxOptions(apiQueryHelper, convertOptions) ?? apiQuery.value;
    if (options?.pageStart) paginationOptions.pageStart = options.pageStart;
    if (options?.pageLimit) paginationOptions.pageLimit = options.pageLimit;
};
const handleSort = async (sortBy, sortDesc) => {
    paginationOptions.sortBy = sortBy;
    paginationOptions.sortDesc = sortDesc;
    apiQuery.value = getApiQueryWithToolboxOptions(apiQueryHelper, { sortBy, sortDesc }) ?? apiQuery.value;
};
const handleRefresh = async () => {
    attachedGeneralAccountsQuery.refetch();
};
const handleSync = () => {
    if (!state.trustedAccountId) {
        console.warn('trustedAccountId is not found');
    }
    syncTrustedAccount({
        trusted_account_id: state.trustedAccountId,
    });
};

const handleViewSyncError = () => {
    state.errorModalVisible = true;
};
const handleCloseErrorModal = () => {
    state.errorModalVisible = false;
};
const handleSelectType = async (value: string) => {
    state.selectedType = value;
    const statusFilterIndex = apiQuery.value.filter?.findIndex((filter) => filter.k === 'state') || -1;

    const isAllSelected = value === 'ALL';

    if (statusFilterIndex === -1 && !isAllSelected) {
        apiQuery.value.filter?.push({ k: 'state', v: value, o: 'eq' });
    } else if (apiQuery.value.filter && statusFilterIndex !== -1) {
        if (isAllSelected) {
            apiQuery.value.filter?.splice(statusFilterIndex, 1);
        } else {
            apiQuery.value.filter[statusFilterIndex].v = value;
        }
    }
};

</script>

<template>
    <p-pane-layout class="service-account-attached-general-accounts">
        <p-heading-layout>
            <template #heading>
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ATTACHED_GENERAL_ACCOUNTS_TITLE')"
                           use-total-count
                           :total-count="totalCount"
                />
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
                <div class="h-full pt-8 px-4 pb-4">
                    <p-tooltip :contents="!state.isSyncEnabled ? $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.DISABLED_SYNC_DESC') : ''"
                               position="left"
                    >
                        <p-button :disabled="!state.isSyncEnabled"
                                  style-type="secondary"
                                  :loading="state.isSyncing || isSyncing"
                                  @click="handleSync"
                        >
                            {{ (state.isSyncing || isSyncing) ? $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SYNCING') : $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SYNC_NOW') }}
                        </p-button>
                    </p-tooltip>
                </div>
            </template>
        </p-heading-layout>
        <div class="content-wrapper">
            <div class="content-header">
                <div class="left-wrapper">
                    <div class="select-type-wrapper">
                        <span class="mr-2">{{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.STATE') }}</span>
                        <p-select-status v-for="(item, idx) in state.typeField"
                                         :key="idx"
                                         :selected="state.selectedType"
                                         class="mr-2"
                                         :value="item.name"
                                         @change="handleSelectType"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                    <p-divider vertical
                               class="divider"
                    />
                    <div v-if="state.isOriginAutoSyncEnabled"
                         class="auto-sync-wrapper"
                    >
                        <span v-if="state.lastSuccessSynced">
                            <span class="label">{{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.LAST_SYNCED') }}</span>
                            {{ dayjs(state.lastSuccessSynced).tz(state.timezone).format('YYYY-MM-DD HH:mm:ss') }}
                        </span>
                        <p-i v-if="['SUCCESS', 'FAILURE'].includes(state.lastSyncJob?.status)"
                             :name="(state.lastSyncJob?.status === 'FAILURE') ? 'ic_error-filled' : 'ic_check'"
                             :color="(state.lastSyncJob?.status === 'FAILURE') ? red[400] : green[600]"
                             width="1rem"
                             height="1rem"
                             class="icon-info"
                        />
                        <p-button v-if="state.lastSyncJob?.status === 'FAILURE'"
                                  style-type="tertiary"
                                  size="sm"
                                  @click="handleViewSyncError"
                        >
                            {{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.ERROR_FOUND') }}
                        </p-button>
                    </div>
                </div>
                <p-toolbox :searchable="false"
                           :total-count="totalCount"
                           :page-size.sync="paginationOptions.pageLimit"
                           :page-size-options="[15,30,45]"
                           @change="handleChange"
                           @refresh="handleRefresh"
                />
            </div>
            <p-data-table :fields="state.fields"
                          :items="attachedGeneralAccountsData?.results || []"
                          sortable
                          :loading="isLoading"
                          :sort-by="paginationOptions.sortBy"
                          :sort-desc="paginationOptions.sortDesc"
                          @changeSort="handleSort"
            >
                <template #col-name-format="{value, item}">
                    <p-link action-icon="internal-link"
                            new-tab
                            :to="{
                                name: SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
                                params: {
                                    serviceAccountId: item.service_account_id,
                                    workspaceId: item.workspace_id
                                },
                            }"
                    >
                        {{ value }}
                    </p-link>
                </template>
                <template #col-workspace_id-format="{value}">
                    <span v-if="userWorkspaceStore.getters.workspaceMap[value]"
                          class="workspace-id-wrapper"
                    >
                        <workspace-logo-icon :text="userWorkspaceStore.getters.workspaceMap[value]?.name || ''"
                                             :theme="userWorkspaceStore.getters.workspaceMap[value]?.tags?.theme"
                                             size="xs"
                        /><span>{{ userWorkspaceStore.getters.workspaceMap[value]?.name }}</span>
                    </span>
                    <span v-else>-</span>
                </template>
                <template #col-state-format="{value}">
                    <p-status v-bind="stateFormatter(value)"
                              class="capitalize"
                    />
                </template>
                <template #col-project_id-format="{value}">
                    <span class="project-id-wrapper">
                        <router-link :to="getProjectDetailLocation(value)"
                                     target="_blank"
                        >
                            <span>{{ referenceMap.project[value]?.label || value }}</span>
                            <p-i name="ic_arrow-right-up"
                                 width="0.75rem"
                                 height="0.75rem"
                                 class="icon-link"
                            />
                        </router-link>
                    </span>
                </template>
                <template #col-last_synced_at-format="{value}">
                    {{ value ? dayjs(value).tz(state.timezone).format('YYYY-MM-DD HH:mm:ss') : '-' }}
                </template>
                <template #col-created_at-format="{value}">
                    {{ dayjs(value).tz(state.timezone).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
            </p-data-table>
        </div>
        <p-button-modal v-model="state.errorModalVisible"
                        :header-title="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.SYNC_ERROR_MODAL_TITLE')"
                        hide-footer-close-button
                        style-type="tertiable"
                        @confirm="handleCloseErrorModal"
        >
            <template #body>
                <p-code-editor :code="state.lastSyncJob?.error_message" />
            </template>
            <template #footer-extra>
                {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FINISHED') }}: {{ dayjs(state.lastSyncJob.finished_at).tz(state.timezone).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </p-button-modal>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.service-account-attached-general-accounts {
    :deep(.toolbox) {
        .tool {
            margin-bottom: unset;
        }
    }

    .content-wrapper {
        @apply mb-16 pt-2;

        .content-header {
            @apply flex justify-between items-center px-4 text-label-md;
            .left-wrapper {
                @apply flex items-center;
                flex-shrink: 0;
                margin-bottom: 1rem;
                gap: 0.5rem;
                .select-type-wrapper {
                    @apply flex items-center text-gray-600;
                    gap: 0.5rem;
                }
                .divider {
                    height: 0.875rem;
                }
                .auto-sync-wrapper {
                    @apply flex gap-1 items-center;
                    margin-left: 0.5rem;
                    .label {
                        @apply text-gray-600;
                        margin-right: 1rem;
                    }
                }
            }
        }
    }

    .workspace-id-wrapper {
        @apply flex gap-2;
    }
}

</style>
