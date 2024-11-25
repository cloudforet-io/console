<script setup lang="ts">
import { PI } from '@cloudforet/mirinae';

import TaskFieldTypeIcon from '@/services/ops-flow/task-fields-configuration/components/TaskFieldTypeIcon.vue';
import { useTaskFieldMetadataStore } from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import TaskFieldGenerator from '@/services/ops-flow/task-fields-configuration/TaskFieldGenerator.vue';

const taskFieldMetadataStore = useTaskFieldMetadataStore();
</script>

<template>
    <div class="grid grid-cols-12 rounded-lg border border-gray-200">
        <div class="col-span-8 p-4 pl-2 flex flex-col gap-2 rounded-l-lg bg-gray-100 border-r border-gray-200">
            <task-field-generator v-for="field in taskFieldMetadataStore.defaultFields"
                                  :key="field.field_id"
                                  :field-type="field.field_type"
                                  is-fixed
            />
        </div>
        <div class="col-span-4 right p-4 rounded-r-lg flex flex-col gap-2">
            <button v-for="field in taskFieldMetadataStore.taskFieldTypeMetadataList"
                    :key="field.type"
                    class="border border-gray-200 rounded-xl p-2 flex items-center gap-2"
            >
                <task-field-type-icon :icon="field.icon" />
                <span class="flex-grow text-label-md">{{ field.name }}</span>
                <p-i name="ic_plus"
                     height="1rem"
                     width="1rem"
                />
            </button>
        </div>
    </div>
</template>
