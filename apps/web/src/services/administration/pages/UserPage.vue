<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import { PHorizontalLayout } from '@spaceone/design-system';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import UserManagementAddModal from '@/services/administration/components/UserManagementAddModal.vue';
import UserManagementHeader from '@/services/administration/components/UserManagementHeader.vue';
import UserManagementStatusModal from '@/services/administration/components/UserManagementStatusModal.vue';
import UserManagementTab from '@/services/administration/components/UserManagementTab.vue';
import UserManagementTable from '@/services/administration/components/UserManagementTable.vue';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const appContextStore = useAppContextStore();
const userPageStore = useUserPageStore();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    hasManagePermission: useManagePermissionState(),
});

/* API */
const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);
const refreshUserList = () => {
    userPageStore.$patch((_state) => {
        _state.loading.list = true;
    });
    try {
        if (storeState.isAdminMode) {
            userPageStore.listUsers({ query: userListApiQueryHelper.data });
        } else {
            userPageStore.listWorkspaceUsers({ query: userListApiQueryHelper.data });
        }
    } finally {
        userPageStore.$patch((_state) => {
            _state.loading.list = false;
        });
    }
};

onUnmounted(() => {
    userPageStore.$dispose();
    userPageStore.$reset();
});

/* Watcher */
watch(() => storeState.isAdminMode, async () => {
    await refreshUserList();
}, { immediate: true });
</script>

<template>
    <section class="user-page">
        <user-management-header />
        <p-horizontal-layout class="user-toolbox-layout">
            <template #container="{ height }">
                <user-management-table :table-height="height"
                                       @confirm="refreshUserList"
                />
            </template>
        </p-horizontal-layout>
        <user-management-tab :manage-disabled="!state.hasManagePermission" />
        <user-management-add-modal @confirm="refreshUserList" />
        <user-management-status-modal @confirm="refreshUserList" />
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
