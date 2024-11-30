<script setup lang="ts">
import {
    defineAsyncComponent, ref, watch, computed,
} from 'vue';

import type { TaskField, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskCreatePageStore } from '@/services/ops-flow/stores/task-create-page-store';

const TextTaskField = defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/TextTaskField.vue'));
const ParagraphTaskField = defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ParagraphTaskField.vue'));
const COMPONENT_MAP: Partial<Record<TaskFieldType, ReturnType<typeof defineAsyncComponent>>> = {
    TEXT: TextTaskField,
    PARAGRAPH: ParagraphTaskField,
    LABELS: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/LabelsTaskField.vue')),
    DROPDOWN: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/DropdownTaskField.vue')),
    DATE: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/DateTaskField.vue')),
    USER: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/UserTaskField.vue')),
    PROJECT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ProjectTaskField.vue')),
    // ASSET: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/AssetTaskField.vue')),
    // PROVIDER: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ProviderTaskField.vue')),
    // SERVICE_ACCOUNT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ServiceAccountTaskField.vue')),
};
const UnknownTaskField = defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/UnknownTaskField.vue'));

const taskCreatePageStore = useTaskCreatePageStore();
const taskCreatePageGetters = taskCreatePageStore.getters;
const taskCategoryStore = useTaskCategoryStore();

// const fields = ref<TaskField[]>([
//     {
//         field_id: 'field_1',
//         name: 'text',
//         field_type: 'TEXT',
//         is_required: true,
//         is_primary: true,
//         options: {},
//     },
//     {
//         field_id: 'field_2',
//         name: 'paragraph',
//         field_type: 'PARAGRAPH',
//         is_required: true,
//         is_primary: true,
//         options: {},
//     },
//     {
//         field_id: 'field_3',
//         name: 'labels',
//         field_type: 'LABELS',
//         is_required: true,
//         is_primary: true,
//     },
//     {
//         field_id: 'field_4',
//         name: 'dropdown',
//         field_type: 'DROPDOWN',
//         is_required: true,
//         is_primary: true,
//         options: {
//             enums: [{ key: '1', name: 'option1' }, { key: '2', name: 'option2' }],
//         },
//     },
//     {
//         field_id: 'field_5',
//         name: 'date',
//         field_type: 'DATE',
//         is_required: true,
//         is_primary: true,
//     },
//     {
//         field_id: 'field_6',
//         name: 'project',
//         field_type: 'PROJECT',
//         is_required: true,
//         is_primary: true,
//     },
//     {
//         field_id: 'field_7',
//         name: 'provider',
//         field_type: 'PROVIDER',
//         is_required: true,
//         is_primary: true,
//     },
//     {
//         field_id: 'field_8',
//         name: 'service_account',
//         field_type: 'SERVICE_ACCOUNT',
//         is_required: true,
//         is_primary: true,
//     },
//     {
//         field_id: 'field_9',
//         name: 'user',
//         field_type: 'USER',
//         is_required: true,
//         is_primary: true,
//     },
//     {
//         field_id: 'field_10',
//         name: 'asset',
//         field_type: 'ASSET',
//         is_required: true,
//         is_primary: true,
//     },
// ]);

// const data = ref<Record<string, any>>({
//     field_1: 'text',
//     field_2: 'paragraph',
//     field_3: ['label1', 'label2'],
//     field_4: ['1'],
//     field_5: '2022-01-01',
//     field_6: ['project'],
//     field_7: ['provider'],
//     field_8: ['service_account'],
//     field_9: ['user'],
//     field_10: ['asset'],
// });
const nameField = computed<TaskField>(() => ({
    field_id: 'name',
    name: 'Title', // TODO: i18n
    field_type: 'TEXT',
    is_required: true,
    is_primary: true,
    options: {
        example: 'Task Title',
    },
}));
const descriptionField = computed<TaskField>(() => ({
    field_id: 'description',
    name: 'Description', // TODO: i18n
    field_type: 'PARAGRAPH',
    is_required: true,
    is_primary: true,
    options: {
        example: 'Task Description',
    },
}));
const fields = ref<TaskField[]>([]);

const name = ref('');
const description = ref('');
const data = ref<Record<string, any>>({});

watch([
    () => taskCategoryStore.getters.loading,
    () => taskCreatePageGetters.currentCategory,
], async ([loading, currentCategory]) => {
    if (loading) return;
    if (currentCategory) {
        fields.value = currentCategory.fields;
    }
}, { immediate: true });

</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Default Fields -->
        <text-task-field :field="nameField"
                         :value="name"
                         @update:value="name = $event"
        />
        <paragraph-task-field :field="descriptionField"
                              :value="description"
                              @update:value="description = $event"
        />
        <!-- Dynamic Fields -->
        <component :is="COMPONENT_MAP[field.field_type] ?? UnknownTaskField"
                   v-for="field in fields"
                   :key="field.field_id"
                   :field="field"
                   :value="data[field.field_id]"
                   @update:value="data[field.field_id] = $event"
        />
    </div>
</template>
