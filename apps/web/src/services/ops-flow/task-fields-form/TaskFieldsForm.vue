<script setup lang="ts">
import {
    computed, defineAsyncComponent, onUnmounted,
} from 'vue';

import type { TaskFieldType } from '@/api-clients/opsflow/_types/task-field-type';

import { useTaskQuery } from '@/services/ops-flow/composables/use-task-query';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';


const COMPONENT_MAP: Partial<Record<TaskFieldType, ReturnType<typeof defineAsyncComponent>>> = {
    TEXT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/TextTaskField.vue')),
    PARAGRAPH: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ParagraphTaskField.vue')),
    LABELS: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/LabelsTaskField.vue')),
    DROPDOWN: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/DropdownTaskField.vue')),
    DATE: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/DateTaskField.vue')),
    USER: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/UserTaskField.vue')),
    PROJECT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ProjectTaskField.vue')),
    SERVICE_ACCOUNT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ServiceAccountTaskField.vue')),
    ASSET: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/AssetTaskField.vue')),
    // PROVIDER: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/ProviderTaskField.vue')),
};
const UnknownTaskField = defineAsyncComponent(() => import('@/services/ops-flow/task-fields-form/field-templates/UnknownTaskField.vue'));

const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;

/* task */
const { data: originTask } = useTaskQuery({
    taskId: computed(() => taskContentFormState.currentTaskId),
});

/* fields form */
onUnmounted(() => {
    taskContentFormStore.resetFieldsForm();
});
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Default Fields -->
        <component :is="COMPONENT_MAP[field.field_type] ?? UnknownTaskField"
                   v-for="field in taskContentFormGetters.defaultFields"
                   :key="field.field_id"
                   :field="field"
                   :value="taskContentFormGetters.defaultData[field.field_id]"
                   :readonly="!taskContentFormGetters.isEditable"
                   :files="originTask?.files"
                   :references="taskContentFormGetters.references"
                   @update:value="taskContentFormStore.setDefaultFieldData(field.field_id, $event)"
                   @update:file-ids="taskContentFormStore.setFileIds"
                   @update:is-valid="taskContentFormStore.setDefaultFieldValidation(field.field_id, $event)"
        />
        <!-- Dynamic Fields -->
        <component :is="COMPONENT_MAP[field.field_type] ?? UnknownTaskField"
                   v-for="field in taskContentFormGetters.fieldsToShow"
                   :key="field.field_id"
                   :field="field"
                   :value="taskContentFormGetters.data[field.field_id]"
                   :readonly="!taskContentFormGetters.isEditable"
                   :files="originTask?.files"
                   :references="taskContentFormGetters.references"
                   @update:value="taskContentFormStore.setFieldData(field.field_id, $event)"
                   @update:file-ids="taskContentFormStore.setFileIds"
                   @update:is-valid="taskContentFormStore.setFieldValidation(field.field_id, $event)"
        />
    </div>
</template>
