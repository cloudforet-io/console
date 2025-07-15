<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import { PHorizontalLayout } from '@cloudforet/mirinae';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import UserAssignToGroupModal from '@/services/iam/components/UserAssignToGroupModal.vue';
import UserManagementAddModal from '@/services/iam/components/UserManagementAddModal.vue';
import UserManagementFormModal from '@/services/iam/components/UserManagementFormModal.vue';
import UserManagementHeader from '@/services/iam/components/UserManagementHeader.vue';
import UserManagementOnlyRemoveWorkspaceGroupTypeModal
    from '@/services/iam/components/UserManagementRemoveModal/UserManagementOnlyRemoveWorkspaceGroupTypeModal.vue';
import UserManagementRemoveMixedTypeModal
    from '@/services/iam/components/UserManagementRemoveModal/UserManagementRemoveMixedTypeModal.vue';
import UserManagementStatusModal from '@/services/iam/components/UserManagementStatusModal.vue';
import UserManagementTab from '@/services/iam/components/UserManagementTab.vue';
import UserManagementTable from '@/services/iam/components/UserManagementTable.vue';
import { useUserPageStore } from '@/services/iam/store/user-page-store';

const appContextStore = useAppContextStore();
const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const authorizationStore = useAuthorizationStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    globalGrantLoading: computed(() => appContextStore.getters.globalGrantLoading),
    grantInfo: computed(() => authorizationStore.state.currentGrantInfo),
});

/* Watcher */
watch(() => storeState.globalGrantLoading, (globalGrantLoading) => {
    if (globalGrantLoading) return;
    userPageState.isAdminMode = storeState.isAdminMode;
}, { immediate: true });

/* Unmount */
onUnmounted(() => {
    userPageStore.reset();
});
</script>

<template>
    <section class="user-page">
        <user-management-header :has-read-write-access="hasReadWriteAccess" />
        <p-horizontal-layout class="user-toolbox-layout">
            <template #container="{ height }">
                <user-management-table :table-height="height"
                                       :has-read-write-access="hasReadWriteAccess"
                />
            </template>
        </p-horizontal-layout>
        <user-management-tab :has-read-write-access="hasReadWriteAccess" />
        <user-management-add-modal v-if="hasReadWriteAccess" />
        <user-management-only-remove-workspace-group-type-modal v-if="hasReadWriteAccess" />
        <user-management-remove-mixed-type-modal v-if="hasReadWriteAccess" />
        <user-management-status-modal v-if="hasReadWriteAccess" />
        <user-management-form-modal v-if="hasReadWriteAccess" />
        <user-assign-to-group-modal v-if="hasReadWriteAccess" />
    </section>
</template>

<style lang="postcss" scoped>
.user-page {
    @apply mx-0;
    max-width: 100%;
}

/* custom design-system component - p-horizontal-layout */
:deep(.user-toolbox-layout) {
    .horizontal-contents {
        overflow: unset;
    }
}
</style>
