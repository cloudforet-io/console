<script setup lang="ts">
import { computed } from 'vue';

import { PFieldTitle, PDataTable } from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { TaskModel } from '@/schema/opsflow/task/model';

const props = defineProps<{
    tasks: TaskModel[];
}>();

const fields = computed<DataTableField[]>(() => [
    {
        name: 'name',
        label: 'Name',
        width: '30%',
    },
    {
        name: 'description',
        label: 'Description',
        width: '70%',
    },
]);
</script>

<template>
    <div>
        <p-field-title class="mb-2">
            Task
        </p-field-title>
        <p-data-table :fields="fields"
                      :items="props.tasks"
        />
    </div>
</template>

