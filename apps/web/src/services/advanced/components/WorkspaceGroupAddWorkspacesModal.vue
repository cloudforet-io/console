<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal, PFieldGroup, PSelectDropdown } from '@cloudforet/mirinae';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const state = reactive({
    groupName: '',
    loading: false,
    // TODO: temp data
    items: [{
        is_dormant: undefined,
        label: '🫠',
        name: 'workspace-6282f1404a07',
        tags: {
            description: 'hi',
            theme: 'green',
        },
    },
    {
        is_dormant: undefined,
        label: '🙏🏻',
        name: 'workspace-440db588c999',
        tags: {
            description: '',
            theme: 'blue',
        },
    },
    {
        type: 'showMore',
        label: 'show more',
    }],
});

const handleConfirm = () => {
    workspaceGroupPageStore.closeModal();
};

const handleCancel = () => {
    workspaceGroupPageStore.closeModal();
};

const handleClose = () => {
    workspaceGroupPageStore.closeModal();
};

const dropdownMenuHandler = () => ({
    results: state.items,
});
</script>

<template>
    <p-button-modal class="workspace-group-add-workspaces-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES"
                    :loading="state.loading"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @close="handleClose"
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
                                :loading="state.loading"
                                appearance-type="badge"
                                is-filterable
                                multi-selectable
                                show-delete-all-button
                                use-fixed-menu-style
                                page-size="10"
                                show-select-marker
                                :handler="dropdownMenuHandler"
                                :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.CREAET_DROP_DOWN_PLACEHOLDER')"
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
