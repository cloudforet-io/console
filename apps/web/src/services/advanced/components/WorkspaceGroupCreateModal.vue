<script setup lang="ts">
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceGroupCreateParameters } from '@/schema/identity/workspace-group/api-verbs/create';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';
import type { CreateModalMenuItem } from '@/schema/identity/workspace-group/type';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';





const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void,
}>();

const state = reactive({
    loading: false,
    groupName: '',
    selectedItems: [] as CreateModalMenuItem[],
});

const dropdownState = reactive({
    loading: false,
    searchText: '',
    menuItems: [] as SelectDropdownMenuItem[],
});

const resetState = () => {
    state.groupName = '';
    state.selectedItems = [];
};

const workspaceListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);

const createWorkspaceGroup = async () => {
    state.loading = true;

    try {
        await SpaceConnector.clientV2.identity.workspaceGroup.create<WorkspaceGroupCreateParameters, WorkspaceGroupModel>({
            name: workspaceGroupPageGetters.selectedGroup.name,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

const handleConfirm = async () => {
    await createWorkspaceGroup();
    showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_CREATE_WORKSPACE'), '');
    workspaceGroupPageStore.closeModal();
    resetState();
    emit('confirm');
};

const handleCancel = () => {
    workspaceGroupPageStore.closeModal();
    resetState();
};

const handleClose = () => {
    workspaceGroupPageStore.closeModal();
    resetState();
};

const fetchWorkspaceList = async (inputText: string) => {
    dropdownState.loading = true;

    workspaceListApiQueryHelper.setFilters([
        { k: 'name', v: inputText, o: '' },
        { k: 'state', v: 'ENABLED', o: '' },
    ]);

    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceListApiQueryHelper.data,
        });
        dropdownState.menuItems = (results ?? []).map((workspace) => ({
            label: workspace.name,
            name: workspace.workspace_id,
            tags: workspace.tags,
            is_dormant: workspace.is_dormant,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        dropdownState.loading = false;
    }
};

const dropdownMenuHandler = async (inputText: string) => {
    await fetchWorkspaceList(inputText);

    return {
        results: dropdownState.menuItems,
    };
};
</script>

<template>
    <p-button-modal class="workspace-group-create-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.CREATE"
                    :loading="state.loading"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group
                    required
                    :label="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_GROUP_NAME')"
                    style-type="secondary"
                >
                    <p-text-input v-model="state.groupName"
                                  :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_GROUP_NAME_PLACEHOLDER')"
                                  block
                    />
                </p-field-group>
                <p-field-group
                    :label="$t('IAM.WORKSPACE_GROUP.MODAL.WORKSPACE_SELECT_DROP_DOWN_TITLE')"
                    style-type="secondary"
                >
                    <template #default>
                        <div class="dropdown-wrapper">
                            <p-select-dropdown
                                :loading="dropdownState.loading"
                                appearance-type="stack"
                                is-filterable
                                multi-selectable
                                show-delete-all-button
                                use-fixed-menu-style
                                page-size="10"
                                show-select-marker
                                :handler="dropdownMenuHandler"
                                :search-text.sync="dropdownState.searchText"
                                :selected.sync="state.selectedItems"
                                :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_DROP_DOWN_PLACEHOLDER')"
                                class="workspace-select-dropdown"
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
                                            <!-- <p-status v-if="item?.is_dormant"
                                                      v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                                                      class="capitalize state"
                                            /> -->
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
