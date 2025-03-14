<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PButtonModal, PSelectDropdown, PFieldTitle } from '@cloudforet/mirinae';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostDataSourceAccountModel } from '@/api-clients/cost-analysis/data-source-account/schema/model';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { CostLinkedAccountModalType } from '@/services/cost-explorer/types/data-sources-type';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const workspaceListApiQueryHelper = new ApiQueryHelper();

const emit = defineEmits<{(e: 'confirm', promises: Promise<void>[]): void; }>();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    visible: computed<boolean>(() => dataSourcesPageState.modal.visible),
    type: computed<CostLinkedAccountModalType|undefined>(() => dataSourcesPageState.modal.type),
    linkedAccounts: computed<CostDataSourceAccountModel[]>(() => dataSourcesPageGetters.linkedAccounts),
    selectedLinkedAccountsIndices: computed<number[]>(() => dataSourcesPageState.selectedLinkedAccountsIndices),
});
const state = reactive({
    headerTitle: computed<TranslateResult>(() => {
        if (storeState.type === 'RESET') {
            return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESET_MODAL_TITLE', { count: storeState.selectedLinkedAccountsIndices.length });
        }
        if (storeState.type === 'UPDATE') {
            return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATE_MODAL_TITLE', { count: storeState.selectedLinkedAccountsIndices.length });
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

const handleConfirm = () => {
    const promises = storeState.selectedLinkedAccountsIndices.map((idx) => {
        const item = storeState.linkedAccounts[idx];
        const defaultParams = {
            data_source_id: item.data_source_id,
            account_id: item.account_id,
        };
        if (storeState.type === 'RESET') {
            return dataSourcesPageStore.resetLinkedAccount(defaultParams);
        }
        return dataSourcesPageStore.updateLinkedAccount({
            ...defaultParams,
            workspace_id: dropdownState.selectedMenuId,
        });
    });

    handleClose();
    emit('confirm', promises);
};

const handleClose = () => {
    dataSourcesPageStore.setModal(false, undefined);
};
const getWorkspaceInfo = (id: string): WorkspaceModel|undefined => {
    if (!id) return undefined;
    return storeState.workspaceList.find((i) => i.workspace_id === id);
};
const handleSelectDropdownItem = async (menuItem: string) => {
    dropdownState.selectedMenuId = menuItem;
};

const workspaceMenuHandler: AutocompleteHandler = async (inputText: string, pageStart = 1, pageLimit = 10) => {
    dropdownState.loading = true;

    workspaceListApiQueryHelper.setFilters([
        { k: 'name', v: inputText, o: '' },
        { k: 'state', v: 'ENABLED', o: '=' },
    ]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceListApiQueryHelper.data,
        });
        const refinedMenuItems = (results ?? []).map((i) => ({
            label: i.name,
            name: i.workspace_id,
        }));
        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);

        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            more: false,
        };
    } finally {
        dropdownState.loading = false;
    }
};
</script>

<template>
    <p-button-modal class="data-source-management-modal"
                    :header-title="state.headerTitle"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :theme-color="storeState.type === 'RESET' ? 'alert' : 'primary'"
                    :visible="storeState.visible"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div v-if="storeState.type === 'UPDATE'"
                 class="modal-content"
            >
                <p-field-title class="title"
                               :label="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_WORKSPACE')"
                />
                <p-select-dropdown use-fixed-menu-style
                                   page-size="10"
                                   :visible-menu.sync="dropdownState.visible"
                                   :loading="dropdownState.loading"
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
                {{ storeState.type === 'RESET' ? $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESET') : $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATE') }}
                <span> {{ storeState.selectedLinkedAccountsIndices.length }}</span>
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
