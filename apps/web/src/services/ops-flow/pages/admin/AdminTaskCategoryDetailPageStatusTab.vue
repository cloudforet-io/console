<script setup lang="ts">
import { PHeadingLayout, PHeading, PButton } from '@cloudforet/mirinae';

import TaskStatusTree from '@/services/ops-flow/components/TaskStatusTree.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
</script>

<template>
    <div class="py-6 px-4">
        <p-heading-layout>
            <template #heading>
                <p-heading heading-type="sub">
                    Status
                </p-heading>
            </template>
            <template #extra>
                <p-button style-type="substitutive"
                          icon-left="ic_plus_bold"
                          @click="taskCategoryPageStore.openAddStatusForm()"
                >
                    Add Status
                </p-button>
            </template>
        </p-heading-layout>
        <p class="mt-2 text-label-md text-gray-600">
            티켓 상태를 보고 사용자 지정 티켓 상태를 만들어 워크플로우 배치를 향상시키고 고객과의 커뮤니케이션을 개선하세요.
        </p>
        <task-status-tree class="mt-4" />
    </div>
</template>
