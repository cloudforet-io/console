<script setup lang="ts">
import { computed } from 'vue';

import type { TaskStatusType } from '@/schema/opsflow/task/type';

import TaskStatusList from '@/services/ops-flow/components/TaskStatusList.vue';

const taskStatusTree = computed<{
    key: TaskStatusType,
    name: string,
}[]>(() => [
    { key: 'TODO', name: 'To-do' },
    { key: 'IN_PROGRESS', name: 'In progress' },
    { key: 'COMPLETED', name: 'Completed' },
]);
</script>

<template>
    <div>
        <template v-for="taskStatus in taskStatusTree">
            <task-status-list :key="taskStatus.key"
                              :header="taskStatus.name"
                              :items="[]"
            />
        </template>
    </div>
</template>
