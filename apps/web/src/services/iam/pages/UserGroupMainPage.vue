<script lang="ts" setup>
import { PHorizontalLayout } from '@cloudforet/mirinae';

import UserGroupManagementHeader from '@/services/iam/components/UserGroupManagementHeader.vue';
import UserGroupManagementTab from '@/services/iam/components/UserGroupManagementTab.vue';
import UserGroupManagementTable from '@/services/iam/components/UserGroupManagementTable.vue';
</script>

<template>
    <section class="user-group-page">
        <user-group-management-header />
        <p-horizontal-layout class="user-group-toolbox-layout">
            <template #container="{height}">
                <user-group-management-table :table-height="height" />
            </template>
        </p-horizontal-layout>
        <user-group-management-tab />
    </section>
</template>

<style scoped lang="postcss">
.user-group-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
