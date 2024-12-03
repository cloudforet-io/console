<script setup lang="ts">
import {
    defineAsyncComponent, computed, onBeforeMount, ref, watch,
} from 'vue';

import { isEqual } from 'lodash';

import {
    PFieldGroup, PTextInput, PToggleButton, PCheckbox,
} from '@cloudforet/mirinae';

import type {
    TaskField,
    TaskFieldOptions,
    TaskFieldType,
} from '@/schema/opsflow/_types/task-field-type';

import { useFieldValidator } from '@/common/composables/form-validator';

import {
    DEFAULT_FIELD_ID_MAP,
    MULTI_SELECTION_FIELD_TYPES,
} from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import TaskFieldGeneratorHeader from '@/services/ops-flow/task-fields-configuration/TaskFieldGeneratorHeader.vue';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

const COMPONENT_MAP: Partial<Record<TaskFieldType, ReturnType<typeof defineAsyncComponent>>> = {
    DROPDOWN: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generator-templates/DropdownOptionsGenerator.vue')),
    PARAGRAPH: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generator-templates/ParagraphOptionsGenerator.vue')),
};

const props = defineProps<{
    field: TaskField;
}>();
const emit = defineEmits<{(event: 'delete'): void;
    (event: 'update:field', value: TaskField): void;
    (event: 'update:is-valid', value: boolean): void;
}>();

const taskFieldMetadataStore = useTaskFieldMetadataStore();
const taskFieldMetadataStoreGetters = taskFieldMetadataStore.getters;

const fieldMetadata = computed<TaskFieldTypeMetadata>(() => taskFieldMetadataStoreGetters.taskFieldTypeMetadataMap[props.field.field_type]);
const optionsComponent = computed<ReturnType<typeof defineAsyncComponent>|undefined>(() => COMPONENT_MAP[props.field.field_type]);

const isDefaultField = computed(() => !!DEFAULT_FIELD_ID_MAP[props.field.field_id]);
const {
    value: name, setValue: setName, resetValidation: resetNameValidation, isInvalid: isNameInvalid, validationResult: isNameValid,
} = useFieldValidator<string|undefined>('', (val?: string) => (val ? val.trim().length > 0 : false));
const options = ref<TaskFieldOptions>({});
const isOptionsValid = ref<boolean>(false);
const isRequired = ref<boolean>(false);
const isPrimary = ref<boolean>(false);
const isFolded = ref<boolean>(false);
const isAllValid = computed<boolean>(() => isNameValid.value && (optionsComponent.value ? isOptionsValid.value : true));

const field = computed<TaskField>(() => {
    const result: TaskField = {
        ...props.field,
        name: name.value,
        options: options.value,
        is_required: isRequired.value,
        is_primary: isPrimary.value,
    };
    if (!result.selection_type && MULTI_SELECTION_FIELD_TYPES.includes(props.field.field_type)) {
        result.selection_type = 'MULTI';
    }
    return result;
});
watch(field, (newField) => {
    if (isEqual(newField, props.field)) return;
    emit('update:field', newField);
});
watch(isAllValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

onBeforeMount(() => {
    setName(props.field.name ?? fieldMetadata.value.name);
    resetNameValidation();
    options.value = props.field.options ?? {};
    isOptionsValid.value = false;
    isRequired.value = props.field.is_required ?? isDefaultField.value;
    isPrimary.value = props.field.is_primary ?? isDefaultField.value;
    isFolded.value = isDefaultField.value;
});
</script>

<template>
    <div class="bg-white border border-gray-150 rounded-lg">
        <task-field-generator-header :field-metadata="fieldMetadata"
                                     :name="name"
                                     :is-required="isRequired"
                                     :is-deletable="DEFAULT_FIELD_ID_MAP[props.field.field_type] === undefined"
                                     :is-folded="isFolded"
                                     :is-default-field="isDefaultField"
                                     @update:is-folded="isFolded = $event"
                                     @delete="emit('delete')"
        />
        <div v-if="!isFolded">
            <div class="py-4 pl-8 pr-2 border-b border-gray-150">
                <p-field-group label="Field Name"
                               :invalid="isNameInvalid"
                               required
                >
                    <p-text-input :value="name"
                                  :placeholder="props.field.name || fieldMetadata.name"
                                  :invalid="isNameInvalid"
                                  @update:value="setName($event)"
                    />
                </p-field-group>
                <component :is="optionsComponent"
                           :options="options"
                           @update:options="options = $event"
                           @update:is-valid="isOptionsValid = $event"
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
