<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTableCheckModal } from '@cloudforet/mirinae';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.$state;

const tableState = reactive({
    items: computed(() => userGroupPageStore.selectedUsers),
    fields: computed(() => [
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
    ]),
});

const handleConfirm = () => {};

const handleCancel = () => {
    userGroupPageStore.closeModal();
};

const handleClose = () => {
    userGroupPageStore.closeModal();
};
</script>

<template>
    <p-table-check-modal class="user-group-status-modal"
                         :header-title="userGroupPageState.modal.title"
                         :theme-color="userGroupPageState.modal.themeColor"
                         :visible="userGroupPageState.modal.visible === USER_GROUP_MODAL_TYPE.STATUS"
                         :loading="userGroupPageState.loading"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         size="sm"
                         @confirm="handleConfirm"
                         @cancel="handleCancel"
                         @close="handleClose"
    >
        <template #col-user_id-format="{value}">
            <span>{{ value }}</span>
        </template>
        <template #col-name-format="{value}">
            <span>{{ value }}</span>
        </template>
    </p-table-check-modal>
</template>
