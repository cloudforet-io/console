<script setup lang="ts">
import { computed } from 'vue';
import draggable from 'vuedraggable';

import { PI } from '@cloudforet/mirinae';

import type { TaskField } from '@/schema/opsflow/_types/task-field-type';


import AddTaskFieldButton from '@/services/ops-flow/task-fields-configuration/components/AddTaskFieldButton.vue';
import { useTaskFieldMetadataStore } from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import TaskFieldGenerator from '@/services/ops-flow/task-fields-configuration/TaskFieldGenerator.vue';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

const props = defineProps<{
    fields: TaskField[];
}>();
const emit = defineEmits<{(event: 'update:fields', value: TaskField[]): void;
    (event: 'add-field', field: TaskFieldTypeMetadata): void;
    (event: 'remove-field', fieldId: string, index: number): void;
    (event: 'update-field-validation', fieldId: string, isValid: boolean): void}>();

const taskFieldMetadataStore = useTaskFieldMetadataStore();
const taskFieldMetadataStoreGetters = taskFieldMetadataStore.getters;

const draggableFields = computed<TaskField[]>({
    get() {
        return props.fields;
    },
    set(value: TaskField[]) {
        emit('update:fields', value);
    },
});

</script>

<template>
    <div class="grid grid-cols-12 rounded-lg border border-gray-200">
        <div class="col-span-8 p-4 pl-2 rounded-l-lg bg-gray-100 border-r border-gray-200">
            <div class="flex flex-col gap-2">
                <task-field-generator v-for="field in taskFieldMetadataStoreGetters.defaultFields"
                                      :key="field.field_id"
                                      :field="field"
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
                         :key="field.field_id"
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
                                              @delete="emit('remove-field', field.field_id, idx)"
                                              @update:field="draggableFields[idx] = $event"
                                              @update:is-valid="emit('update-field-validation', field.field_id, $event)"
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
</template>

<style lang="postcss" scoped>
.drag-handle {
    cursor: grab;
}
</style>
