<script setup lang="ts">
import { PI } from '@cloudforet/mirinae';

import { useTaskFieldMetadata } from '@/services/ops-flow/composables/use-task-field-metadata';
import TaskFieldGenerator from '@/services/ops-flow/task-fields-configuration/TaskFieldGenerator.vue';

const { defaultFields, taskFieldMetadataList } = useTaskFieldMetadata();
</script>

<template>
    <div class="grid grid-cols-12 rounded-lg border border-gray-200">
        <div class="col-span-8 p-4 pl-2 rounded-l-lg bg-gray-100 border-r border-gray-200">
            <task-field-generator v-for="field in defaultFields"
                                  :key="field.field_id"
            />
        </div>
        <div class="col-span-4 right p-4 rounded-r-lg flex flex-col gap-2">
            <button v-for="field in taskFieldMetadataList"
                    :key="field.type"
                    class="border border-gray-200 rounded-xl p-2 flex items-center gap-2"
            >
                <span class="flex-shrink-0 inline-flex items-center w-5 h-5 bg-gray-150 rounded-md">
                    <p-i :name="field.icon"
                         height="1.25rem"
                         width="1.25rem"
                    />
                </span>
                <span class="flex-grow text-label-md">{{ field.name }}</span>
                <p-i name="ic_plus"
                     height="1rem"
                     width="1rem"
                />
            </button>
        </div>
    </div>
</template>
