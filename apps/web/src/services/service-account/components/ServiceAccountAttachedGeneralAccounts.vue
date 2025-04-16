<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
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


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import { SERVICE_ACCOUNT_STATE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { green, red } from '@/styles/colors';

import { getAccountFields, stateFormatter } from '@/services/service-account/helpers/dynamic-ui-schema-generator';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';

const props = withDefaults(defineProps<{
    serviceAccountId: string;
    attachedGeneralAccounts: ServiceAccountModel[];
    hasReadWriteAccess?: boolean;
}>(), {
    serviceAccountId: undefined,
    attachedGeneralAccounts: () => ([]),
});

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();

const { getReferenceLocation } = useReferenceRouter();

const emit = defineEmits<{(e: 'update:attached-general-accounts', attachedGeneralAccounts: ServiceAccountModel[]): void;
}>();
const state = reactive({
    project: computed(() => allReferenceStore.getters.project),
    loading: true,
    syncReqLoading: false,
    items: [] as any,
    sortBy: 'name',
    sortDesc: true,
    totalCount: 0,
    pageLimit: 15,
    isSyncEnabled: computed(() => {
        const isDomainScope = serviceAccountPageStore.state.originServiceAccountItem.resource_group === 'DOMAIN';
        const isAdminMode = appContextStore.getters.isAdminMode;
        if (isDomainScope) {
            return isAdminMode;
        } return serviceAccountPageStore.getters.isOriginAutoSyncEnabled;
    }),
    trustedAccountId: computed(() => serviceAccountPageStore.state.originServiceAccountItem.trusted_account_id),
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    lastSuccessSynced: computed(() => serviceAccountPageStore.getters.lastSuccessSynced),
    errorModalVisible: false,
    isSyncing: computed(() => ['IN_PROGRESS', 'PENDING'].includes(serviceAccountPageStore.getters.lastJob?.status)),
    lastSyncJob: computed(() => {
        if (state.isSyncing) {
            return serviceAccountPageStore.getters.secondToLastJob;
        }
        return serviceAccountPageStore.getters.lastJob;
    }),
    fields: computed<DataTableFieldType[]>(() => {
        const generalAccountField = getAccountFields(serviceAccountSchemaStore.getters.generalAccountSchema);
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

const apiQueryHelper = new ApiQueryHelper().setSort(state.sortBy, state.sortDesc).setPageLimit(state.pageLimit).setFilters([
    { k: 'trusted_account_id', v: props.serviceAccountId, o: '=' }]);
let apiQuery = apiQueryHelper.data;
const getAttachedGeneralAccountList = async () => {
    state.loading = true;
    try {
        const { results, total_count } = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
            query: apiQuery,
        });
        state.items = results;
        state.totalCount = total_count ?? 0;
        if (results) emit('update:attached-general-accounts', results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};
const getProjectDetailLocation = (id: string) => getReferenceLocation(id, { resource_type: 'identity.Project' });
const handleChange = async (options?: ToolboxOptions) => {
    try {
        state.loading = true;
        await Promise.allSettled([
            userWorkspaceStore.load(),
            allReferenceStore.load('project'),
            allReferenceStore.load('service_account'),
        ]);
        const convertOptions = {
            ...options,
            sortBy: state.sortBy,
            sortDesc: state.sortDesc,
        };
        apiQuery = getApiQueryWithToolboxOptions(apiQueryHelper, convertOptions) ?? apiQuery;
        await getAttachedGeneralAccountList();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const handleSort = async (sortBy, sortDesc) => {
    state.sortBy = sortBy;
    state.sortDesc = sortDesc;
    try {
        apiQuery = getApiQueryWithToolboxOptions(apiQueryHelper, { sortBy, sortDesc }) ?? apiQuery;
        await getAttachedGeneralAccountList();
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleSync = async () => {
    try {
        state.syncReqLoading = true;
        await SpaceConnector.clientV2.identity.trustedAccount.sync({
            trusted_account_id: serviceAccountPageStore.state.originServiceAccountItem.trusted_account_id,
        });
        showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.START_SYNC'), '');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        if (state.trustedAccountId) await serviceAccountPageStore.fetchSyncJobList(state.trustedAccountId);
        state.syncReqLoading = false;
    }
};

const handleViewSyncError = () => {
    state.errorModalVisible = true;
};
const handleCloseErrorModal = () => {
    state.errorModalVisible = false;
};
const handleSelectType = async (value: string) => {
    state.selectedType = value;
    const statusFilterIndex = apiQuery.filter?.findIndex((filter) => filter.k === 'state') || -1;

    const isAllSelected = value === 'ALL';

    if (statusFilterIndex === -1 && !isAllSelected) {
        apiQuery.filter?.push({ k: 'state', v: value, o: 'eq' });
    } else if (apiQuery.filter && statusFilterIndex !== -1) {
        if (isAllSelected) {
            apiQuery.filter?.splice(statusFilterIndex, 1);
        } else {
            apiQuery.filter[statusFilterIndex].v = value;
        }
    }
    await getAttachedGeneralAccountList();
};

const init = async () => {
    await getAttachedGeneralAccountList();
};


let syncCheckInterval;
watch(() => state.isSyncing, async (isSyncing) => {
    if (isSyncing) {
        syncCheckInterval = setInterval(async () => {
            if (state.trustedAccountId) await serviceAccountPageStore.fetchSyncJobList(state.trustedAccountId);
        }, 10000);
    }
    if (!isSyncing) {
        if (syncCheckInterval) clearInterval(syncCheckInterval);
    }
}, { immediate: true });

onUnmounted(() => {
    if (syncCheckInterval) clearInterval(syncCheckInterval);
});

watch(() => state.trustedAccountId, async (ta) => {
    if (ta) await serviceAccountPageStore.fetchSyncJobList(ta);
});

(async () => {
    await init();
})();
</script>

<template>
    <p-pane-layout class="service-account-attached-general-accounts">
        <p-heading-layout>
            <template #heading>
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ATTACHED_GENERAL_ACCOUNTS_TITLE')"
                           use-total-count
                           :total-count="state.totalCount"
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
                                  :loading="state.isSyncing || state.syncReqLoading"
                                  @click="handleSync"
                        >
                            {{ (state.isSyncing || state.syncReqLoading) ? $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SYNCING') : $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SYNC_NOW') }}
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
                    <div v-if="serviceAccountPageStore.getters.isOriginAutoSyncEnabled"
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
                           :total-count="state.totalCount"
                           :page-size.sync="state.pageLimit"
                           :page-size-options="[15,30,45]"
                           @change="handleChange"
                           @refresh="handleChange()"
                />
            </div>
            <p-data-table :fields="state.fields"
                          :items="state.items"
                          sortable
                          :loading="state.loading"
                          :sort-by="state.sortBy"
                          :sort-desc="state.sortDesc"
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
                            <span>{{ state.project[value]?.label }}</span>
                            <p-i name="ic_arrow-right-up"
                                 width="0.75rem"
                                 height="0.75rem"
                                 class="icon-link"
                            />
                        </router-link>
                    </span>
                </template>
                <template #col-created_at-format="{value}">
                    {{ dayjs(value.data).tz(state.timezone).format('YYYY-MM-DD HH:mm:ss') }}
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
