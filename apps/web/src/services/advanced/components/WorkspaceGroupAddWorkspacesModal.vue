<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PFieldGroup, PSelectDropdown } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceChangeWorkspaceGroupParameters } from '@/schema/identity/workspace/api-verbs/change-workspace-group';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceTabState = workspaceGroupPageStore.workspaceTabState;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const state = reactive({
    loading: false,
    workspaceDropdownFilter: computed<ConsoleFilter[]>(() => [
        { k: 'workspace_id', v: workspaceTabState.workspacesInSelectedGroup.map((w) => w.workspace_id) || [], o: '!=' },
    ]),
});

const workspaceDropdownFilter = computed<ConsoleFilter[]>(() => [
    { k: 'workspace_id', v: workspaceTabState.workspacesInSelectedGroup.map((w) => w.workspace_id) || [], o: '!=' },
]);

const {
    loading, searchText, menuList, selectedItems, handleClickShowMore, reset,
} = useSelectDropDownList<WorkspaceModel>({
    pageSize: 10,
    transformer: (_workspace) => ({
        name: _workspace.workspace_id,
        label: _workspace.name,
        tags: _workspace.tags,
        is_dormant: _workspace.is_dormant,
    }),
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
        query: apiQueryHelper.data,
    }),
    filter: workspaceDropdownFilter,
});

const addWorkspace = async () => {
    state.loading = true;

    try {
        if (!selectedItems.value.length) {
            return;
        }
        // eslint-disable-next-line max-len
        await Promise.allSettled(selectedItems.value.map((item) => SpaceConnector.clientV2.identity.workspace.changeWorkspaceGroup<WorkspaceChangeWorkspaceGroupParameters, WorkspaceModel>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroupId,
            workspace_id: item.name,
        })));
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_ADD_WORKSPACE'), '');

        await workspaceGroupPageStore.fetchWorkspaceGroups({ blockSelectedIndicesReset: true });
        await workspaceGroupPageStore.listWorkspacesInSelectedGroup();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const resetForm = () => {
    selectedItems.value = [];
};
const handleConfirm = async () => {
    await addWorkspace();
    workspaceGroupPageStore.closeModal();
    resetForm();
};

const handleCloseModal = () => {
    resetForm();
    workspaceGroupPageStore.closeModal();
};

watch(() => workspaceGroupPageState.modal, (value) => {
    if (value.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES) {
        console.log('reset', value);
        console.log('filter', state.workspaceDropdownFilter);
        reset();
    }
});
</script>

<template>
    <p-button-modal class="workspace-group-add-workspaces-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES"
                    :loading="state.loading"
                    :disabled="!selectedItems.length"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCloseModal"
                    @close="handleCloseModal"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.WORKSPACE_SELECT_DROP_DOWN_TITLE')"
                >
                    <template #default>
                        <div class="dropdown-wrapper">
                            <p-select-dropdown
                                :loading="loading"
                                :search-text.sync="searchText"
                                appearance-type="badge"
                                is-filterable
                                multi-selectable
                                show-delete-all-button
                                use-fixed-menu-style
                                show-select-marker
                                disable-handler
                                :menu="menuList"
                                :selected.sync="selectedItems"
                                :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_DROP_DOWN_PLACEHOLDER')"
                                class="workspace-select-dropdown"
                                @click-show-more="handleClickShowMore"
                            >
                                <template #menu-item--format="{ item }">
                                    <div class="menu-item-wrapper"
                                         :class="{'is-dormant': item?.is_dormant}"
                                    >
                                        <div class="label">
                                            <workspace-logo-icon :text="item?.label || ''"
                                                                 :theme="item?.tags?.theme"
                                                                 size="xs"
                                            />
                                            <span class="label-text">{{ item.label }}</span>
                                        </div>
                                    </div>
                                </template>
                            </p-select-dropdown>
                        </div>
                    </template>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspace-select-dropdown {
    .menu-item-wrapper {
        @apply flex justify-between;
        max-width: 100%;

        .label {
            @apply flex items-center gap-2;
        }
        .state {
            @apply text-label-sm;
        }
        .label-text {
            @apply truncate;
            max-width: 36.875rem;
        }
        &.is-dormant {
            .label-text {
                max-width: 31.25rem;
            }
        }
    }
}
</style>
