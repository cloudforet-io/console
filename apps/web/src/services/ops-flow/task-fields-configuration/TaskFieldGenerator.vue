<script setup lang="ts">
import {
    defineAsyncComponent, computed, onBeforeMount, toRef,
} from 'vue';

import {
    PFieldGroup, PTextInput, PToggleButton, PCheckbox,
} from '@cloudforet/mirinae';

import type { TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import {
    useTaskFieldGenerator,
} from '@/services/ops-flow/task-fields-configuration/composables/use-task-field-generator';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import TaskFieldGeneratorHeader from '@/services/ops-flow/task-fields-configuration/TaskFieldGeneratorHeader.vue';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

const COMPONENT_MAP = {
    dropdown: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generator-templates/DropdownOptionsGenerator.vue')),
    paragraph: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generator-templates/ParagraphOptionsGenerator.vue')),
};

const props = defineProps<{
    fieldType: TaskFieldType;
    fieldId: string;
}>();

const taskFieldMetadataStore = useTaskFieldMetadataStore();
const fieldMetadata = computed<TaskFieldTypeMetadata>(() => taskFieldMetadataStore.taskFieldTypeMetadataMap[props.fieldType]);
const {
    isDefaultField,
    fieldId,
    fieldName,
    setFieldName,
    isFieldNameInvalid,
    fieldNameInvalidText,
    resetFieldNameValidation,
    options,
    isRequired,
    isPrimary,
    isFolded,
} = useTaskFieldGenerator({
    fieldId: toRef(props, 'fieldId'),
});

onBeforeMount(() => {
    setFieldName(fieldMetadata.value.name);
    resetFieldNameValidation();
    isRequired.value = isDefaultField.value;
    isPrimary.value = isDefaultField.value;
    isFolded.value = isDefaultField.value;
});
</script>

<template>
    <div class="bg-white border border-gray-150 rounded-lg">
        <task-field-generator-header :field-metadata="fieldMetadata"
                                     :name="fieldName"
                                     :is-required="isRequired"
                                     :is-deletable="DEFAULT_FIELD_ID_MAP[props.fieldType] === undefined"
                                     :is-folded="isFolded"
                                     :is-default-field="isDefaultField"
                                     @update:is-folded="isFolded = $event"
        />
        <div v-if="!isFolded">
            <div class="py-4 pl-8 pr-2 border-b border-gray-150">
                <p-field-group label="Field Name"
                               :invalid-text="fieldNameInvalidText"
                               :invalid="isFieldNameInvalid"
                               required
                >
                    <p-text-input :value="fieldName"
                                  :placeholder="fieldMetadata.name"
                                  :invalid="isFieldNameInvalid"
                                  @update:value="setFieldName"
                    />
                </p-field-group>
                <component :is="COMPONENT_MAP[props.fieldType]"
                           :key="fieldId"
                           :options="options"
                />
                <p-field-group label="Show on Ticket Creation"
                               required
                               class="mt-4"
                >
                    <p class="text-paragraph-sm mb-2">
                        Display this field during task creation
                    </p>
                    <p-toggle-button :value.sync="isPrimary"
                                     :disabled="isDefaultField"
                                     show-state-text
                                     position="left"
                    />
                </p-field-group>
            </div>
            <div class="h-9 pl-8 flex items-center">
                <p-checkbox :selected="isRequired"
                            :value="true"
                            :disabled="isDefaultField"
                            @change="isRequired = $event"
                >
                    This Field is Required
                </p-checkbox>
            </div>
        </div>
    </div>
</template>
