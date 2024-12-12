<script setup lang="ts">
import { computed } from 'vue';

import { PDataTable } from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { TaskModel } from '@/schema/opsflow/task/model';

import BoardTaskDescriptionField from '@/services/ops-flow/components/BoardTaskDescriptionField.vue';
import BoardTaskNameField from '@/services/ops-flow/components/BoardTaskNameField.vue';

const props = defineProps<{
    tasks: TaskModel[];
}>();

const fields = computed<DataTableField[]>(() => [
    {
        name: 'name',
        label: 'Name',
        width: '14rem',
    },
    {
        name: 'description',
        label: 'Description',
        width: '20rem',
    },
]);
</script>

<template>
    <div>
        <p-data-table :fields="fields"
                      :items="props.tasks"
        >
            <template #col-name-format="{item}">
                <board-task-name-field :task-id="item.task_id"
                                       :name="item.name"
                                       link-new-tab
                />
            </template>
            <template #col-description-format="{item}">
                <board-task-description-field :description="item.description"
                                              :files="item.files"
                />
            </template>
        </p-data-table>
    </div>
</template>

