<script setup lang="ts">
import { computed } from 'vue';

import {
    PHeadingLayout, PHeading, PButton, PIconButton, PDataTable,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/admin/task-type-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskTypeStore = useTaskTypeStore();

const taskTypeFields = computed<DataTableField[]>(() => [
    {
        name: 'name',
        label: 'Name',
        width: '20%',
    },
    {
        name: 'description',
        label: 'Description',
        width: '70%',
    },
    {
        name: 'buttons',
        label: ' ',
    },
]);
</script>

<template>
    <div class="py-6 px-4">
        <p-heading-layout>
            <template #heading>
                <p-heading heading-type="sub">
                    Ticket Topic
                </p-heading>
            </template>
            <template #extra>
                <p-icon-button name="ic_refresh"
                               @click="taskTypeStore.list()"
                />
                <p-button style-type="substitutive"
                          icon-left="ic_plus_bold"
                          @click="taskCategoryPageStore.openAddTaskTypeForm()"
                >
                    Add Ticket Topic
                </p-button>
            </template>
        </p-heading-layout>
        <p class="mt-2 mb-6 text-label-md text-gray-600">
            티켓 양식으로 티켓에 포함된 필드와 데이터를 결정합니다. 여러 티켓 양식을 만들 수 있습니다. <br>
            예를 들어 서비스별로 서로 다른 양식을 만들 수 있습니다. 그런 경우에는 최종 사용자가 적절한 양식을 선택하여 요청을 제출합니다.
        </p>
        <p-data-table :loading="!taskCategoryPageStore.getters.taskTypes"
                      :items="taskCategoryPageStore.getters.taskTypes"
                      :fields="taskTypeFields"
        >
            <template #col-buttons-format="{ item }">
                <div class="flex justify-end">
                    <action-menu-button @edit="taskCategoryPageStore.openEditTaskTypeForm(item.task_type_id)"
                                        @delete="taskCategoryPageStore.openDeleteTaskTypeModal(item.task_type_id)"
                    />
                </div>
            </template>
        </p-data-table>
    </div>
</template>
