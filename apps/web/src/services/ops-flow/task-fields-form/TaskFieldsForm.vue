<script setup lang="ts">
import {
    defineAsyncComponent, computed,
} from 'vue';

import type { TaskField, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';

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

const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;

/* default fields */
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
    is_required: false,
    is_primary: true,
    options: {
        example: 'Task Description',
    },
}));
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Default Fields -->
        <text-task-field :field="nameField"
                         :value="taskContentFormState.name"
                         @update:value="taskContentFormStore.setName($event)"
                         @update:is-valid="taskContentFormStore.setIsNameValid($event)"
        />
        <paragraph-task-field :field="descriptionField"
                              :value="taskContentFormState.description"
                              @update:value="taskContentFormStore.setDescription($event)"
        />
        <!-- Dynamic Fields -->
        <component :is="COMPONENT_MAP[field.field_type] ?? UnknownTaskField"
                   v-for="field in taskContentFormGetters.currentFields"
                   :key="field.field_id"
                   :field="field"
                   :value="taskContentFormState.data[field.field_id]"
                   @update:value="taskContentFormStore.setFieldData(field.field_id, $event)"
                   @update:is-valid="taskContentFormState.dataValidationMap[field.field_id] = $event"
        />
    </div>
</template>
