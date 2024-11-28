<script setup lang="ts">
import {
    defineAsyncComponent, ref,
} from 'vue';

import type { TaskField, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';


const COMPONENT_MAP: Partial<Record<TaskFieldType, ReturnType<typeof defineAsyncComponent>>> = {
    TEXT: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/TextTaskField.vue')),
    PARAGRAPH: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/ParagraphTaskField.vue')),
    LABELS: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/LabelsTaskField.vue')),
    DROPDOWN: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/DropdownTaskField.vue')),
    DATE: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/DateTaskField.vue')),
    USER: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/UserTaskField.vue')),
    ASSET: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/AssetTaskField.vue')),
    PROJECT: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/ProjectTaskField.vue')),
    PROVIDER: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/ProviderTaskField.vue')),
    SERVICE_ACCOUNT: defineAsyncComponent(() => import('@/services/ops-flow/task-field-forms/field-templates/ServiceAccountTaskField.vue')),
};
const fields = ref<TaskField[]>([
    {
        field_id: '1',
        name: 'text',
        field_type: 'TEXT',
        is_required: true,
        is_primary: true,
        options: {},
    },
    {
        field_id: '2',
        name: 'paragraph',
        field_type: 'PARAGRAPH',
        is_required: true,
        is_primary: true,
        options: {},
    },
    {
        field_id: '3',
        name: 'labels',
        field_type: 'LABELS',
        is_required: true,
        is_primary: true,
        options: {},
    },
    {
        field_id: '4',
        name: 'dropdown',
        field_type: 'DROPDOWN',
        is_required: true,
        is_primary: true,
        options: {
            enums: [{ key: '1', name: 'option1' }, { key: '2', name: 'option2' }],
        },
    },
    {
        field_id: '5',
        name: 'date',
        field_type: 'DATE',
        is_required: true,
        is_primary: true,
        options: {},
    },
    {
        field_id: '8',
        name: 'project',
        field_type: 'PROJECT',
        is_required: true,
        is_primary: true,
        options: {},
    },
]);

</script>

<template>
    <div>
        <component :is="COMPONENT_MAP[field.field_type]"
                   v-for="field in fields"
                   :key="field.field_id"
        />
    </div>
</template>
