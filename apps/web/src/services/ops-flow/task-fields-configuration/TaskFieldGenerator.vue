<script setup lang="ts">
import { defineAsyncComponent, ref, computed } from 'vue';

import type { TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import {
    useTaskFieldGenerator,
} from '@/services/ops-flow/task-fields-configuration/composables/use-task-field-generator';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import TaskFieldGeneratorDetails from '@/services/ops-flow/task-fields-configuration/TaskFieldGeneratorDetails.vue';
import TaskFieldGeneratorHeader from '@/services/ops-flow/task-fields-configuration/TaskFieldGeneratorHeader.vue';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

const COMPONENT_MAP = {
    dropdown: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generators/DropdownOptionsGenerator.vue')),
    paragraph: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generators/ParagraphOptionsGenerator.vue')),
};

const props = defineProps<{
    fieldType: TaskFieldType;
}>();

const taskFieldMetadataStore = useTaskFieldMetadataStore();

const {
    fieldName,
    options,
    isRequired,
} = useTaskFieldGenerator({
    fieldMetadata: computed<TaskFieldTypeMetadata>(() => taskFieldMetadataStore.taskFieldTypeMetadataMap[props.fieldType]),
});

const type = ref('dropdown');
</script>

<template>
    <div class="bg-white border border-gray-150 rounded-lg">
        <task-field-generator-header :field-type="props.fieldType"
                                     :name="fieldName"
                                     :is-required="isRequired"
                                     :is-deletable="DEFAULT_FIELD_ID_MAP[props.fieldType] === undefined"
        />
        <task-field-generator-details>
            <template #options>
                <component :is="COMPONENT_MAP[type]"
                           :options="options"
                />
            </template>
        </task-field-generator-details>
    </div>
</template>
