<script lang="ts" setup>
import { reactive } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import UserGroupManagementAddGroupInfo from '@/services/iam/components/UserGroupManagementAddGroupInfo.vue';
import UserGroupManagementAddNotificationChannelInfo
    from '@/services/iam/components/UserGroupManagementAddNotificationChannelInfo.vue';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = () => {
    state.loading = true;
    try {
        emit('confirm');
    } catch (e: any) {
        console.error(e);
    } finally {
        state.loading = false;
        handleClose();
    }
};

const handleClose = () => {
    console.log('TODO: handleClose');
};
</script>

<template>
    <p-button-modal class="user-group-management-edit-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.visible === 'create' || userGroupPageState.modal.visible === 'update'"
                    size="md"
                    @confirm="handleConfirm"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <user-group-management-add-group-info />
                <user-group-management-add-notification-channel-info />
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.user-group-management-edit-modal {
    min-height: 34.875rem;
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>
