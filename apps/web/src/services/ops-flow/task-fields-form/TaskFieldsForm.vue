<script setup lang="ts">
import {
    defineAsyncComponent, ref,
} from 'vue';

import type { TaskField, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';


const COMPONENT_MAP: Partial<Record<TaskFieldType, ReturnType<typeof defineAsyncComponent>>> = {
    TEXT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/TextTaskField.vue')),
    PARAGRAPH: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ParagraphTaskField.vue')),
    LABELS: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/LabelsTaskField.vue')),
    DROPDOWN: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/DropdownTaskField.vue')),
    DATE: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/DateTaskField.vue')),
    USER: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/UserTaskField.vue')),
    ASSET: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/AssetTaskField.vue')),
    PROJECT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ProjectTaskField.vue')),
    PROVIDER: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ProviderTaskField.vue')),
    SERVICE_ACCOUNT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ServiceAccountTaskField.vue')),
};
const fields = ref<TaskField[]>([
    {
        field_id: 'field_1',
        name: 'text',
        field_type: 'TEXT',
        is_required: true,
        is_primary: true,
        options: {},
    },
    {
        field_id: 'field_2',
        name: 'paragraph',
        field_type: 'PARAGRAPH',
        is_required: true,
        is_primary: true,
        options: {},
    },
    {
        field_id: 'field_3',
        name: 'labels',
        field_type: 'LABELS',
        is_required: true,
        is_primary: true,
    },
    {
        field_id: 'field_4',
        name: 'dropdown',
        field_type: 'DROPDOWN',
        is_required: true,
        is_primary: true,
        options: {
            enums: [{ key: '1', name: 'option1' }, { key: '2', name: 'option2' }],
        },
    },
    {
        field_id: 'field_5',
        name: 'date',
        field_type: 'DATE',
        is_required: true,
        is_primary: true,
    },
    {
        field_id: 'field_6',
        name: 'project',
        field_type: 'PROJECT',
        is_required: true,
        is_primary: true,
    },
    {
        field_id: 'field_7',
        name: 'provider',
        field_type: 'PROVIDER',
        is_required: true,
        is_primary: true,
    },
    {
        field_id: 'field_8',
        name: 'service_account',
        field_type: 'SERVICE_ACCOUNT',
        is_required: true,
        is_primary: true,
    },
    {
        field_id: 'field_9',
        name: 'user',
        field_type: 'USER',
        is_required: true,
        is_primary: true,
    },
    {
        field_id: 'field_10',
        name: 'asset',
        field_type: 'ASSET',
        is_required: true,
        is_primary: true,
    },
]);

const data = ref<Record<string, any>>({
    field_1: 'text',
    field_2: 'paragraph',
    field_3: ['label1', 'label2'],
    field_4: [{ key: 'a', name: 'option1' }, { key: 'b', name: 'option2' }],
    field_5: '2022-01-01',
    field_6: ['project'],
    field_7: ['provider'],
    field_8: ['service_account'],
    field_9: ['user'],
    field_10: ['asset'],
});

</script>

<template>
    <div class="flex flex-col gap-4">
        <component :is="COMPONENT_MAP[field.field_type]"
                   v-for="field in fields"
                   :key="field.field_id"
                   :field="field"
                   :value="data[field.field_id]"
                   @update:value="data[field.field_id] = $event"
        />
    </div>
</template>
