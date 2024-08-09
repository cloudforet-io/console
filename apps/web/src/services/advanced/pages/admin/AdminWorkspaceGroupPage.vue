<script setup lang="ts">
import { PHorizontalLayout } from '@cloudforet/mirinae';

import WorkspaceGroupHeader from '@/services/advanced/components/WorkspaceGroupHeader.vue';
import WorkspaceGroupTab from '@/services/advanced/components/WorkspaceGroupTab.vue';
import WorkspaceGroupTable from '@/services/advanced/components/WorkspaceGroupTable.vue';

</script>

<template>
    <section class="workspace-group-page">
        <workspace-group-header />
        <p-horizontal-layout class="user-group-toolbox-layout">
            <template #container="{ height }">
                <workspace-group-table :table-height="height" />
            </template>
        </p-horizontal-layout>
        <workspace-group-tab />
    </section>
</template>
