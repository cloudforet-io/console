<script setup lang="ts">
import { ref, computed } from 'vue';
import draggable from 'vuedraggable';

import { PI } from '@cloudforet/mirinae';


import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import TaskFieldDeleteModal from '@/services/ops-flow/components/TaskFieldDeleteModal.vue';
import AddTaskFieldButton from '@/services/ops-flow/task-fields-configuration/components/AddTaskFieldButton.vue';
import { useTaskFieldMetadataStore } from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import TaskFieldGenerator from '@/services/ops-flow/task-fields-configuration/TaskFieldGenerator.vue';
import type { MutableTaskField } from '@/services/ops-flow/task-fields-configuration/types/mutable-task-field-type';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';


const props = defineProps<{
    requireProject: TaskTypeModel['require_project'];
    fields: MutableTaskField[];
    originFields?: TaskField[];
}>();
const emit = defineEmits<{(event: 'update:fields', value: TaskField[]): void;
    (event: 'add-field', field: TaskFieldTypeMetadata): void;
    (event: 'remove-field', fieldId: string, index: number): void;
    (event: 'update-field-validation', fieldId: string, isValid: boolean): void}>();

const taskFieldMetadataStore = useTaskFieldMetadataStore();
const taskFieldMetadataStoreGetters = taskFieldMetadataStore.getters;

const defaultFields = computed<TaskField[]>(() => {
    if (props.requireProject) return taskFieldMetadataStoreGetters.projectScopeDefaultFields;
    return taskFieldMetadataStoreGetters.workspaceScopeDefaultFields;
});
const draggableFields = computed<MutableTaskField[]>({
    get() {
        return props.fields;
    },
    set(value: TaskField[]) {
        emit('update:fields', value);
    },
});

const visibleFieldDeleteModal = ref<boolean>(false);
const fieldDeleteTarget = ref<{ field: MutableTaskField, index: number } | undefined>();
const handleFieldDelete = (field: MutableTaskField, idx: number) => {
    if (!props.originFields) { // if it is creation mode
        emit('remove-field', field._field_id, idx);
        return;
    }
    if (!props.originFields.find((f) => f.field_id === field._field_id)) { // if it is newly added field
        emit('remove-field', field._field_id, idx);
        return;
    }
    fieldDeleteTarget.value = { field, index: idx };
    visibleFieldDeleteModal.value = true;
};
const handleFieldDeleteConfirm = () => {
    if (!fieldDeleteTarget.value) {
        ErrorHandler.handleError(new Error('Field delete target is not set'));
        visibleFieldDeleteModal.value = false;
        return;
    }
    visibleFieldDeleteModal.value = false;
    emit('remove-field', fieldDeleteTarget.value.field._field_id, fieldDeleteTarget.value.index);
    fieldDeleteTarget.value = undefined;
};

</script>

<template>
    <div>
        <div class="grid grid-cols-12 rounded-lg border border-gray-200">
            <div class="col-span-8 p-4 pl-2 rounded-l-lg bg-gray-100 border-r border-gray-200">
                <div class="flex flex-col gap-2">
                    <task-field-generator v-for="field in defaultFields"
                                          :key="field.field_id"
                                          :field="field"
                                          :all-fields="defaultFields"
                    />
                </div>
                <div class="border-t border-gray-200 mt-4 pt-4">
                    <draggable v-model="draggableFields"
                               draggable=".draggable-generator"
                               handle=".drag-handle"
                               ghost-class="ghost"
                               class="flex flex-col gap-2"
                    >
                        <div v-for="(field, idx) in draggableFields"
                             :key="field._field_id"
                             class="draggable-generator flex"
                        >
                            <span class="drag-handle flex-shrink-0 inline-flex items-center justify-center h-9 pr-2">
                                <p-i name="ic_drag-handle"
                                     width="1rem"
                                     height="1rem"
                                />
                            </span>
                            <task-field-generator class="flex-grow"
                                                  :field="field"
                                                  :all-fields="draggableFields"
                                                  editable
                                                  @delete="handleFieldDelete(field, idx)"
                                                  @update:field="draggableFields[idx] = $event"
                                                  @update:is-valid="emit('update-field-validation', field._field_id, $event)"
                            />
                        </div>
                    </draggable>
                </div>
            </div>
            <div class="col-span-4 right p-4 rounded-r-lg flex flex-col gap-2">
                <add-task-field-button v-for="field in taskFieldMetadataStoreGetters.taskFieldTypeMetadataList"
                                       :key="field.type"
                                       :icon="field.icon"
                                       :name="field.name"
                                       @click="emit('add-field', field)"
                />
            </div>
        </div>
        <task-field-delete-modal :visible="visibleFieldDeleteModal"
                                 @update:visible="visibleFieldDeleteModal = $event"
                                 @confirm="handleFieldDeleteConfirm"
        />
    </div>
</template>

<style lang="postcss" scoped>
.drag-handle {
    cursor: grab;
}
</style>
