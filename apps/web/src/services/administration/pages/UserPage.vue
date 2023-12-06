<script lang="ts" setup>
import {
    onUnmounted, reactive,
} from 'vue';

import { PHorizontalLayout } from '@spaceone/design-system';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import UserManagementHeader from '@/services/administration/components/UserManagementHeader.vue';
import UserManagementTab from '@/services/administration/components/UserManagementTab.vue';
import UserManagementTable from '@/services/administration/components/UserManagementTable.vue';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();

const state = reactive({
    hasManagePermission: useManagePermissionState(),
});

onUnmounted(() => {
    userPageStore.$dispose();
    userPageStore.$reset();
});
</script>

<template>
    <section class="user-page">
        <user-management-header />
        <p-horizontal-layout class="user-toolbox-layout">
            <template #container="{ height }">
                <user-management-table :table-height="height" />
            </template>
        </p-horizontal-layout>
        <user-management-tab :manage-disabled="!state.hasManagePermission" />
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
