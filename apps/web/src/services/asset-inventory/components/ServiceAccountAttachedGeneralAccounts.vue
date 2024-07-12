<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PPaneLayout, PHeading, PDataTable, PLink, PToolbox, PButton, PI, PButtonModal, PTextEditor, PTooltip,
} from '@cloudforet/mirinae';
import { ACTION_ICON } from '@cloudforet/mirinae/src/inputs/link/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/navigation/toolbox/type';


import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { green, red } from '@/styles/colors';

import { getAccountFields } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/asset-inventory/stores/service-account-schema-store';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

const props = withDefaults(defineProps<{
    serviceAccountId: string;
    attachedGeneralAccounts: ServiceAccountModel[];
}>(), {
    serviceAccountId: undefined,
    attachedGeneralAccounts: () => ([]),
});

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();

const emit = defineEmits<{(e: 'update:attached-general-accounts', attachedGeneralAccounts: ServiceAccountModel[]): void;
}>();
const state = reactive({
    project: computed(() => allReferenceStore.getters.project),
    loading: true,
    syncReqLoading: false,
    items: [] as any,
    sortBy: 'name',
    sortDesc: true,
    domainId: computed(() => store.state.domain.domainId), // TODO: remove this after backend is ready
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
    timezone: computed(() => store.state.user.timezone),
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
            { name: 'workspace_id', label: 'Workspace', sortable: false },
            { name: 'project_id', label: 'Project', sortable: false },
        ];
    }),
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
        <p-heading heading-type="sub"
                   :title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ATTACHED_GENERAL_ACCOUNTS_TITLE')"
                   use-total-count
                   :total-count="state.totalCount"
        >
            <template #extra>
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
            </template>
        </p-heading>
        <div class="content-wrapper">
            <div class="content-header">
                <div v-if="serviceAccountPageStore.getters.isOriginAutoSyncEnabled"
                     class="left"
                >
                    <span v-if="state.lastSuccessSynced">{{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.LAST_SYNCED') }}: {{
                        dayjs(state.lastSuccessSynced).tz(state.timezone).format('YYYY-MM-DD HH:mm:ss')
                    }}</span>
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
                    <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                            new-tab
                            :to="{
                                name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME,
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
                    <span class="workspace-id-wrapper">
                        <workspace-logo-icon :text="userWorkspaceStore.getters.workspaceMap[value]?.name || ''"
                                             :theme="userWorkspaceStore.getters.workspaceMap[value]?.tags?.theme"
                                             size="xs"
                        /><span>{{ userWorkspaceStore.getters.workspaceMap[value]?.name }}</span>
                    </span>
                </template>
                <template #col-project_id-format="{value, item}">
                    <span class="project-id-wrapper">
                        <router-link :to="{ name: PROJECT_ROUTE.DETAIL._NAME, params: { id: value, workspaceId: item.workspace_id } }"
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
            </p-data-table>
        </div>
        <p-button-modal v-model="state.errorModalVisible"
                        :header-title="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.SYNC_ERROR_MODAL_TITLE')"
                        hide-footer-close-button
                        style-type="tertiable"
                        @confirm="handleCloseErrorModal"
        >
            <template #body>
                <p-text-editor :code="state.lastSyncJob?.error_message" />
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
            @apply flex justify-between items-center px-4;

            .left {
                @apply mb-4 flex gap-1 items-center;
                flex-shrink: 0;
            }
        }
    }

    .workspace-id-wrapper {
        @apply flex gap-2;
    }
}

</style>
