<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PHorizontalLayout } from '@cloudforet/mirinae';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import UserBulkMFASettingModal from '@/services/iam/components/mfa/UserBulkMFASettingModal.vue';
import UserMFASecretKeyDeleteModal from '@/services/iam/components/mfa/UserMFASecretKeyDeleteModal.vue';
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

const userListApiQueryHelper = new ApiQueryHelper()
    .setSort('name', true);

/* API */
const refreshUserList = async () => {
    userPageState.loading = true;
    userListApiQueryHelper
        .setPageStart(userPageState.pageStart).setPageLimit(userPageState.pageLimit)
        .setFilters(userPageState.searchFilters);
    try {
        if (storeState.isAdminMode && storeState.grantInfo?.scope === 'DOMAIN') {
            await userPageStore.listUsers({ query: userListApiQueryHelper.data });
        } else if (storeState.grantInfo?.scope === 'WORKSPACE') {
            await userPageStore.listWorkspaceUsers({ query: userListApiQueryHelper.data });
        }
    } finally {
        userPageState.loading = false;
    }
};

/* Watcher */
watch(() => storeState.globalGrantLoading, (globalGrantLoading) => {
    if (globalGrantLoading) return;
    userPageState.isAdminMode = storeState.isAdminMode;
}, { immediate: true });

const init = async () => {
    await userPageStore.listRoles();
    await refreshUserList();
};
const { callApiWithGrantGuard } = useGrantScopeGuard(['DOMAIN', 'WORKSPACE'], init);
callApiWithGrantGuard();

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
                                       @confirm="refreshUserList"
                />
            </template>
        </p-horizontal-layout>
        <user-management-tab :has-read-write-access="hasReadWriteAccess" />
        <user-management-add-modal v-if="hasReadWriteAccess"
                                   @confirm="refreshUserList"
        />
        <user-management-only-remove-workspace-group-type-modal v-if="hasReadWriteAccess" />
        <user-management-remove-mixed-type-modal v-if="hasReadWriteAccess" />
        <user-management-status-modal v-if="hasReadWriteAccess"
                                      @confirm="refreshUserList"
        />
        <user-management-form-modal v-if="hasReadWriteAccess"
                                    @confirm="refreshUserList"
        />
        <user-assign-to-group-modal v-if="hasReadWriteAccess"
                                    @confirm="refreshUserList"
        />
        <user-bulk-m-f-a-setting-modal v-if="hasReadWriteAccess"
                                       @confirm="refreshUserList"
        />
        <user-m-f-a-secret-key-delete-modal v-if="hasReadWriteAccess"
                                            @confirm="refreshUserList"
        />
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
