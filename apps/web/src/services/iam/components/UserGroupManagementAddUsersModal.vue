<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PButtonModal, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const storeState = reactive({
    emailList: computed<MenuItem[]>(() => userGroupPageGetters.usersPerSelectedUserGroup.map((user) => ({
        label: user.user_id,
        name: user.name,
    }))),
});

const handleConfirm = () => {};

const handleClose = () => {};
</script>

<template>
    <p-button-modal class="user-group-management-add-users-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.ADD_NEW_USER"
                    size="md"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <p>User</p>
                <p-select-dropdown :menu="storeState.emailList"
                                   multi-selectable
                                   is-filterable
                />
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.user-group-management-add-users-modal {
    min-height: 34.875rem;
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>
