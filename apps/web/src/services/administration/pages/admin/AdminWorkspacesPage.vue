<script setup lang="ts">

import { PButton, PHeading, PHorizontalLayout } from '@spaceone/design-system';

import WorkspaceManagementTable from '@/services/administration/components/WorkspaceManagementTable.vue';


const handleCreateWorkspace = () => {
    // create workspace modal
};
</script>

<template>
    <section class="workspaces-page">
        <p-heading :title="$t('IAM.WORKSPACES.WORKSPACES')">
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateWorkspace"
                >
                    {{ $t('IAM.WORKSPACES.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-horizontal-layout class="workspace-toolbox-layout">
            <template #container="{ height }">
                <workspace-management-table :table-height="height" />
            </template>
        </p-horizontal-layout>
    </section>
</template>

<style lang="postcss" scoped>
.workspaces-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
