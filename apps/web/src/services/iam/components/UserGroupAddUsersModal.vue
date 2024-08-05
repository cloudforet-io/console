<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButtonModal, PFieldGroup, PSelectDropdown } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.$state;

const state = reactive({
    menu: computed(() => userGroupPageStore.selectedUsers.map(({ user_id, name }) => ({
        name: user_id,
        label: name,
        type: 'item',
    }))),
});

const handleConfirm = () => {
};

const handleCancel = () => {
    userGroupPageStore.closeModal();
};

const handleClose = () => {
    userGroupPageStore.closeModal();
};

const handleDeleteTag = () => {
    // state.currentMenu = state.menu.filter((menu) => deletedTag.name !== menu.name);
};
</script>

<template>
    <p-button-modal class="user-group-add-users-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.visible === USER_GROUP_MODAL_TYPE.ADD_USERS"
                    :loading="userGroupPageState.loading"
                    :disabled="!state.menu.length"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @close="handleClose"
    >
        <template #body>
            <p-field-group
                :label="i18n.t('IAM.USERGROUP.MODAL.ADD.USERS')"
                style-type="secondary"
                required
            >
                <template #default>
                    <div class="dropdown-wrapper">
                        <p-select-dropdown
                            :menu="state.menu"
                            page-size="11"
                            is-filterable
                            is-fixed-width
                            multi-selectable
                            appearance-type="stack"
                            use-fixed-menu-style
                            @delete-tag="handleDeleteTag"
                        />
                    </div>
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.user-group-add-users-modal {
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>
