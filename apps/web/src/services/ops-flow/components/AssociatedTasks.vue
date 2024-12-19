<script setup lang="ts">
import { computed } from 'vue';

import { PDataTable } from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { TaskModel } from '@/schema/opsflow/task/model';
import { i18n } from '@/translations';

import BoardTaskDescriptionField from '@/services/ops-flow/components/BoardTaskDescriptionField.vue';
import BoardTaskNameField from '@/services/ops-flow/components/BoardTaskNameField.vue';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const props = defineProps<{
    tasks: TaskModel[];
}>();
const taskTemplateManagementStore = useTaskManagementTemplateStore();
const fields = computed<DataTableField[]>(() => [
    {
        name: 'name',
        label: i18n.t('OPSFLOW.FIELD_NAME', { field: taskTemplateManagementStore.templates.task }) as string,
        width: '14rem',
    },
    {
        name: 'description',
        label: i18n.t('OPSFLOW.FIELD_DESCRIPTION', { field: taskTemplateManagementStore.templates.task }) as string,
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

