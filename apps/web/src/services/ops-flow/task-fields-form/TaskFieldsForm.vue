<script setup lang="ts">
import {
    defineAsyncComponent, onUnmounted,
} from 'vue';

import type { TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';

const COMPONENT_MAP: Partial<Record<TaskFieldType, ReturnType<typeof defineAsyncComponent>>> = {
    TEXT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/TextTaskField.vue')),
    PARAGRAPH: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ParagraphTaskField.vue')),
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
const taskFieldMetadataStore = useTaskFieldMetadataStore();

onUnmounted(() => {
    taskContentFormStore.resetFieldsForm();
});
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Default Fields -->
        <component :is="COMPONENT_MAP[field.field_type] ?? UnknownTaskField"
                   v-for="field in taskFieldMetadataStore.getters.defaultFields"
                   :key="field.field_id"
                   :field="field"
                   :value="taskContentFormState.defaultData[field.field_id]"
                   :readonly="taskContentFormState.mode === 'view'"
                   :files="taskContentFormState.files"
                   @update:value="taskContentFormStore.setDefaultFieldData(field.field_id, $event)"
                   @update:files="taskContentFormStore.setFiles"
                   @update:is-valid="taskContentFormStore.setDefaultFieldValidation(field.field_id, $event)"
        />
        <!-- Dynamic Fields -->
        <component :is="COMPONENT_MAP[field.field_type] ?? UnknownTaskField"
                   v-for="field in taskContentFormGetters.currentFields"
                   :key="field.field_id"
                   :field="field"
                   :value="taskContentFormState.data[field.field_id]"
                   :readonly="taskContentFormState.mode === 'view'"
                   :files="taskContentFormState.files"
                   @update:value="taskContentFormStore.setFieldData(field.field_id, $event)"
                   @update:files="taskContentFormStore.setFiles"
                   @update:is-valid="taskContentFormStore.setFieldValidation(field.field_id, $event)"
        />
    </div>
</template>
