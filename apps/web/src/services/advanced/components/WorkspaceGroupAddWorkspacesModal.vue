<script setup lang="ts">
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PFieldGroup, PSelectDropdown } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceGroupAddWorkspacesParameters } from '@/schema/identity/workspace-group/api-verbs/add-workspaces';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import type { WorkspaceGroupFetchParameters } from '@/services/advanced/types/admin-workspace-group-type';



const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm', option: WorkspaceGroupFetchParameters): void }>();

const state = reactive({
    loading: false,
});

const {
    loading, searchText, menuList, selectedItems, handleClickShowMore,
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
});

const addWorkspace = async () => {
    state.loading = true;

    try {
        await SpaceConnector.clientV2.identity.workspaceGroup.addWorkspaces<WorkspaceGroupAddWorkspacesParameters>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroup.workspace_group_id,
            workspaces: selectedItems.value.map((item) => item.name),
        });

        if (!selectedItems.value.length) {
            return;
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

const handleConfirm = async () => {
    await addWorkspace();
    workspaceGroupPageStore.closeModal();
    emit('confirm', { isGroupUser: true });
};

const handleCloseModal = () => {
    workspaceGroupPageStore.closeModal();
};
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
                               style-type="secondary"
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
