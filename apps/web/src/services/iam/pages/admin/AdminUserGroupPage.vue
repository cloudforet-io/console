<script setup lang="ts">
import { onUnmounted } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PHorizontalLayout } from '@cloudforet/mirinae';

import UserGroupAddModal from '@/services/iam/components/UserGroupAddModal.vue';
import UserGroupAddUsersModal from '@/services/iam/components/UserGroupAddUsersModal.vue';
import UserGroupHeader from '@/services/iam/components/UserGroupHeader.vue';
import UserGroupStatusModal from '@/services/iam/components/UserGroupStatusModal.vue';
import UserGroupTab from '@/services/iam/components/UserGroupTab.vue';
import UserGroupTable from '@/services/iam/components/UserGroupTable.vue';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.$state;
console.log('AdminUserGroupPage Setup');
const userGroupListApiQuery = new ApiQueryHelper()
    .setSort('name', true);

const fetchUserGroup = async () => {
    userGroupListApiQuery.setPageStart(userGroupPageState.pageStart).setPageLimit(userGroupPageState.pageLimit)
        .setFilters(userGroupPageState.searchFilters);

    await userGroupPageStore.listUsers({ query: userGroupListApiQuery.data });
};

(function init() {
    fetchUserGroup();
}());

onUnmounted(() => {
    userGroupPageStore.$dispose();
    userGroupPageStore.$reset();
});
</script>

<template>
    <section class="user-group-page">
        <user-group-header />
        <p-horizontal-layout class="user-group-toolbox-layout">
            <template #container="{ height }">
                <user-group-table :table-height="height" />
            </template>
        </p-horizontal-layout>
        <user-group-status-modal />
        <user-group-add-users-modal />
        <user-group-add-modal />
        <user-group-tab />
    </section>
</template>

<style lang="postcss" scoped>
.user-group-page {
    @apply mx-0;
    max-width: 100%;
}

/* custom design-system component - p-horizontal-layout */
:deep(.user-group-toolbox-layout) {
    .horizontal-contents {
        overflow: unset;
    }
}
</style>
