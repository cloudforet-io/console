<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PButtonModal, PSelectDropdown, PFieldTitle } from '@cloudforet/mirinae';

import { useDataSourceAccountApi } from '@/api-clients/cost-analysis/data-source-account/composables/use-data-source-account-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { hideLoadingMessage, showLoadingMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useDataSourceAccountListQuery } from '@/services/cost-explorer/composables/use-data-source-account-list-query';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';


const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;

const { dataSourceAccountAPI } = useDataSourceAccountApi();
const resourceMenuHandlerMap = useResourceMenuHandlerMap();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
});
const state = reactive({
    headerTitle: computed<TranslateResult>(() => {
        if (dataSourcesPageState.modalType === 'RESET') {
            return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESET_MODAL_TITLE', { count: dataSourcesPageState.selectedLinkedAccountIds.length });
        }
        if (dataSourcesPageState.modalType === 'UPDATE') {
            return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATE_MODAL_TITLE', { count: dataSourcesPageState.selectedLinkedAccountIds.length });
        }
        return '';
    }),
});
const dropdownState = reactive({
    visible: false,
    loading: false,
    searchText: '',
    selectedMenuId: '',
    menu: computed(() => storeState.workspaceList.map((i) => ({ label: i.name, name: i.workspace_id }))),
});
const isConfirmDisabled = computed(() => {
    if (dataSourcesPageState.modalType === 'RESET') {
        return !dataSourcesPageState.selectedLinkedAccountIds.length;
    }
    return !dropdownState.selectedMenuId;
});

const workspaceMenuHandler = resourceMenuHandlerMap.workspace({
    menuFilters: [
        { k: 'state', v: 'ENABLED', o: '=' },
        { k: 'is_dormant', v: false, o: '=' },
    ],
});

/* Query */
const queryClient = useQueryClient();
const { key: linkedAccountListQueryKey } = useServiceQueryKey('cost-analysis', 'data-source-account', 'list');
const listAccountQueryHelper = new ApiQueryHelper();
const { data: selectedLinkedAccountList } = useDataSourceAccountListQuery({
    params: computed(() => {
        listAccountQueryHelper.setFilters([
            { k: 'account_id', o: '=', v: dataSourcesPageState.selectedLinkedAccountIds },
        ]);
        return {
            data_source_id: dataSourcesPageState.selectedDataSourceId,
            query: listAccountQueryHelper.data,
        };
    }),
    thisPage: computed(() => 1),
    pageSize: computed(() => 45),
});

/* Mutation */
let loadingMessageId: string | undefined;
let delayHideLoadingMessage: Promise<void>;
const { mutate: updateOrResetLinkedAccount } = useMutation<void, Error>({
    onMutate: () => {
        const loadingMessage = dataSourcesPageState.modalType === 'RESET' ? i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESETTING') : i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATING');
        loadingMessageId = showLoadingMessage(loadingMessage, '');
        delayHideLoadingMessage = new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });
    },
    mutationFn: async () => {
        const promises = (selectedLinkedAccountList.value?.results || []).map((item) => {
            const defaultParams = {
                data_source_id: item.data_source_id,
                account_id: item.account_id,
            };
            if (dataSourcesPageState.modalType === 'RESET') {
                return dataSourceAccountAPI.reset(defaultParams);
            }
            return dataSourceAccountAPI.update({
                ...defaultParams,
                workspace_id: dropdownState.selectedMenuId,
            });
        });
        await Promise.allSettled([Promise.allSettled(promises), delayHideLoadingMessage]);
    },
    onSuccess: async () => {
        if (loadingMessageId) {
            hideLoadingMessage(loadingMessageId);
            loadingMessageId = undefined;
        }
        if (dataSourcesPageState.modalType === 'RESET') {
            showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALT_S_RESET'), '');
        } else {
            showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALT_S_UPDATE'), '');
        }
        queryClient.invalidateQueries({ queryKey: linkedAccountListQueryKey.value });
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
    onSettled: async () => {
        handleClose();
    },
});

const handleConfirm = () => {
    updateOrResetLinkedAccount();
};

const handleClose = () => {
    dataSourcesPageStore.setModalVisible(false);
};
const getWorkspaceInfo = (id: string): WorkspaceModel|undefined => {
    if (!id) return undefined;
    return storeState.workspaceList.find((i) => i.workspace_id === id);
};
const handleSelectDropdownItem = (item: string) => {
    dropdownState.selectedMenuId = item;
};
</script>

<template>
    <p-button-modal class="data-source-management-modal"
                    :header-title="state.headerTitle"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :theme-color="dataSourcesPageState.modalType === 'RESET' ? 'alert' : 'primary'"
                    :visible="dataSourcesPageState.modalVisible"
                    :disabled="isConfirmDisabled"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div v-if="dataSourcesPageState.modalType === 'UPDATE'"
                 class="modal-content"
            >
                <p-field-title class="title"
                               :label="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_WORKSPACE')"
                />
                <p-select-dropdown use-fixed-menu-style
                                   :page-size="10"
                                   :visible-menu.sync="dropdownState.visible"
                                   :search-text.sync="dropdownState.searchText"
                                   show-select-marker
                                   is-filterable
                                   is-fixed-width
                                   :handler="workspaceMenuHandler"
                                   class="workspace-select-dropdown"
                                   @select="handleSelectDropdownItem"
                >
                    <template #dropdown-button>
                        <div v-if="dropdownState.selectedMenuId"
                             class="workspace-wrapper"
                        >
                            <workspace-logo-icon :text="getWorkspaceInfo(dropdownState.selectedMenuId)?.name || ''"
                                                 :theme="getWorkspaceInfo(dropdownState.selectedMenuId)?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="label">{{ getWorkspaceInfo(dropdownState.selectedMenuId)?.name || '' }}</span>
                        </div>
                        <span v-else
                              class="select"
                        >{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SELECT_WORKSPACE') }}</span>
                    </template>
                    <template #menu-item--format="{item}">
                        <div class="workspace-menu-item">
                            <workspace-logo-icon :text="getWorkspaceInfo(item.name)?.name || ''"
                                                 :theme="getWorkspaceInfo(item.name)?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="label">{{ item.label }}</span>
                            <span class="state"
                                  :class="[getWorkspaceInfo(item.name)?.state.toLowerCase()]"
                            />
                            <span class="description">{{ getWorkspaceInfo(item.name)?.tags?.description }}</span>
                        </div>
                    </template>
                </p-select-dropdown>
            </div>
        </template>
        <template #confirm-button>
            <span>
                {{ dataSourcesPageState.modalType === 'RESET' ? $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESET') : $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATE') }}
                <span> {{ dataSourcesPageState.selectedLinkedAccountIds.length }}</span>
            </span>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.data-source-management-modal {
    .modal-content {
        @apply flex flex-col;
        padding: 1.125rem 0 3.625rem;
        border: none;
        gap: 0.25rem;
        .workspace-select-dropdown {
            .workspace-wrapper {
                @apply flex items-center;
                width: 100%;
                gap: 0.25rem;
                .label {
                    @apply truncate;
                }
            }
            .select {
                @apply text-gray-600;
            }
            .workspace-menu-item {
                @apply flex items-center;
                gap: 0.375rem;
                .state {
                    @apply rounded-full;
                    width: 0.5rem;
                    height: 0.5rem;
                    &.enabled {
                        @apply bg-green-600;
                    }
                    &.disabled {
                        @apply bg-gray-300;
                    }
                }
                .label {
                    @apply truncate;
                    max-width: 21rem;
                }
                .description {
                    @apply text-label-md text-gray-500;
                }
            }
        }
    }
}
</style>
