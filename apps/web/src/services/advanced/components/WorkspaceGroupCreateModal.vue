<script setup lang="ts">
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceGroupAddWorkspaceParameters } from '@/schema/identity/workspace-group/api-verbs/add_workspaces';
import type { WorkspaceGroupCreateParameters } from '@/schema/identity/workspace-group/api-verbs/create';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceGroupReferenceMap } from '@/store/reference/workspace-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';



const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const allReferenceStore = useAllReferenceStore();

const emit = defineEmits<{(e: 'confirm'): void,
}>();

const state = reactive({
    workspaceGroups: computed<WorkspaceGroupReferenceMap>(() => allReferenceStore.getters.workspace_group),
    workspaceGroupNames: computed(() => Object.values(state.workspaceGroups).map((item:any) => item.name)),
    loading: false,
});

const {
    forms: { groupName }, invalidState, invalidTexts, setForm,
} = useFormValidator({ groupName: '' }, {
    groupName: (value: string) => {
        if (!value.length) {
            return false;
        }
        if (state.workspaceGroupNames.includes(value)) {
            return i18n.t('IAM.WORKSPACE_GROUP.MODAL.CREATE_NAME_INVALID_DUPLICATED');
        }

        return true;
    },
});
const {
    loading, searchText, menuList, selectedItems, handleClickShowMore,
} = useSelectDropDownList({
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

const resetState = () => {
    state.groupName = '';
};

const createWorkspaceGroup = async () => {
    state.loading = true;

    try {
        const { workspace_group_id } = await SpaceConnector.clientV2.identity.workspaceGroup.create<WorkspaceGroupCreateParameters, WorkspaceGroupModel>({
            name: state.groupName,
        });

        if (!selectedItems.value.length) {
            return;
        }

        await SpaceConnector.clientV2.identity.workspaceGroup.addWorkspaces<WorkspaceGroupAddWorkspaceParameters, WorkspaceGroupModel>({
            workspace_group_id,
            workspaces: selectedItems.value.map((item) => item.name as string),
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
    workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_TITLE', { name: state.groupName }),
        visible: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
    });
};

const handleModalClose = () => {
    workspaceGroupPageStore.closeModal();
    resetState();
};
</script>

<template>
    <p-button-modal class="workspace-group-create-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.CREATE"
                    :loading="state.loading"
                    size="sm"
                    :disabled="(groupName === '' || invalidState.groupName)"
                    @confirm="handleConfirm"
                    @cancel="handleModalClose"
                    @close="handleModalClose"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group
                    :required="true"
                    :label="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_GROUP_NAME')"
                    :invalid="invalidState.groupName"
                    :invalid-text="invalidTexts.groupName"
                    style-type="secondary"
                >
                    <p-text-input :value="groupName"
                                  :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_GROUP_NAME_PLACEHOLDER')"
                                  block
                                  @update:value="setForm('groupName', $event)"
                    />
                </p-field-group>
                <p-field-group
                    :label="$t('IAM.WORKSPACE_GROUP.MODAL.WORKSPACE_SELECT_DROP_DOWN_TITLE')"
                    style-type="secondary"
                >
                    <template #default>
                        <div class="dropdown-wrapper">
                            <p-select-dropdown
                                :loading="loading"
                                :search-text.sync="searchText"
                                appearance-type="stack"
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
