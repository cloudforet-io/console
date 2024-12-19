<script setup lang="ts">
import { PHeadingLayout, PHeading, PButton } from '@cloudforet/mirinae';

import TaskStatusTree from '@/services/ops-flow/components/TaskStatusTree.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();
</script>

<template>
    <div class="py-6 px-4">
        <p-heading-layout>
            <template #heading>
                <p-heading heading-type="sub">
                    {{ $t('OPSFLOW.STATUS') }}
                </p-heading>
            </template>
            <template #extra>
                <p-button style-type="substitutive"
                          icon-left="ic_plus_bold"
                          @click="taskCategoryPageStore.openAddStatusForm()"
                >
                    {{ $t('OPSFLOW.ADD_TARGET', { target: $t('OPSFLOW.STATUS') }) }}
                </p-button>
            </template>
        </p-heading-layout>
        <p class="mt-2 text-label-md text-gray-600">
            {{ $t('OPSFLOW.TASK_MANAGEMENT.STATUS.DESC', { tasks: taskManagementTemplateStore.templates.tasks }) }}
        </p>
        <task-status-tree class="mt-4" />
    </div>
</template>
