<script setup lang="ts">
import { reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PSelectDropdown, PIconButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';



const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const state = reactive({
    loading: false,
    roles: [{
        // TODO: temp data
        user_id: 'Kara_Herzog@yahoo.com',
        name: 'asdas',
        state: 'ENABLED',
        label: 'Workspace Member',
        role_type: 'WORKSPACE_OWNER',
    },
    {
        type: 'showMore',
        label: 'show more',
    }],
    users: [{
        // TODO: temp data
        user_id: 'Bradford_McDermott@hotmail.com',
    }],
});

const handleConfirm = () => {
    showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_ADD_USRES'), '');
    workspaceGroupPageStore.closeModal();
};

const handleCancel = () => {
    workspaceGroupPageStore.closeModal();
};

const handleClose = () => {
    workspaceGroupPageStore.closeModal();
};

const roleDropdownMenuHandler = () => ({
    results: state.roles,
});

const userDropdownMenuHandler = () => ({
    results: state.users,
});
</script>

<template>
    <p-button-modal class="workspace-group-add-users-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS"
                    :loading="state.loading"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.ROLE_SELECT_DROP_DOWN_TITLE')"
                               style-type="secondary"
                >
                    <template #default>
                        <p-select-dropdown
                            is-filterable
                            use-fixed-menu-style
                            class="role-select-dropdown"
                            :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.ROLE_DROP_DOWN_PLACEHOLDER')"
                            :handler="roleDropdownMenuHandler"
                        >
                            <template #menu-item--format="{ item }">
                                <div class="role-menu-item">
                                    <img :src="useRoleFormatter(item.role_type).image"
                                         alt="role-type-icon"
                                         class="role-type-icon"
                                    >
                                    <span class="role-label">{{ item.label }}</span>
                                    <span class="role-type">{{ useRoleFormatter(item.role_type, true).name }}</span>
                                </div>
                            </template>
                        </p-select-dropdown>
                    </template>
                </p-field-group>
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.USER_SELECT_DROP_DOWN_TITLE')"
                               style-type="secondary"
                >
                    <template #default>
                        <p-select-dropdown
                            is-filterable
                            use-fixed-menu-style
                            class="user-select-dropdown"
                            :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.USER_DROP_DOWN_PLACEHOLDER')"
                            :handler="userDropdownMenuHandler"
                        >
                            <template #menu-item--format="{ item }">
                                <div class="user-menu-item">
                                    <span class="role-user_id">{{ item.user_id }}</span>
                                    <p-icon-button name="ic_close"
                                                   size="md"
                                    />
                                </div>
                            </template>
                        </p-select-dropdown>
                    </template>
                </p-field-group>
                <!-- TODO: selected user -->
            </div>
        </template>
        <template #confirm-button>
            {{ $t('IAM.WORKSPACE_GROUP.MODAL.ADD') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspace-group-add-users-modal {
    .role-select-dropdown {
        .role-menu-item {
            @apply flex items-center;
            gap: 0.25rem;

            .role-type-icon {
                @apply rounded-full;
                width: 1.5rem;
                height: 1.5rem;
            }

            .role-label {
                @apply truncate;
                flex-grow: 1;
            }

            .role-type {
                @apply text-label-sm text-gray-400;
            }
        }
    }

    .user-select-dropdown {
        .user-menu-item {
            @apply flex items-center justify-between;
            gap: 0.25rem;
        }
    }
}
</style>
