<script setup lang="ts">
import {
    defineAsyncComponent, computed, onBeforeMount, ref, watch,
} from 'vue';

import { isEqual } from 'lodash';

import {
    PFieldGroup, PTextInput, PToggleButton, PCheckbox, PButton,
} from '@cloudforet/mirinae';

import type {
    TaskField,
    TaskFieldOptions,
    TaskFieldType,
} from '@/schema/opsflow/_types/task-field-type';

import InfoTooltip from '@/common/components/guidance/InfoTooltip.vue';
import ChangedMark from '@/common/components/marks/ChangedMark.vue';
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
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

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
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const fieldMetadata = computed<TaskFieldTypeMetadata>(() => taskFieldMetadataStoreGetters.taskFieldTypeMetadataMap[props.field.field_type]);
const optionsComponent = computed<ReturnType<typeof defineAsyncComponent>|undefined>(() => COMPONENT_MAP[props.field.field_type]);

const isDefaultField = computed(() => !!DEFAULT_FIELD_ID_MAP[props.field.field_id]);

/* field id */
const {
    value: fieldId, setValue: setFieldId, isInvalid: isFieldIdInvalid, validationResult: isFieldIdValid,
} = useFieldValidator<string|undefined>('', (val?: string) => (val ? val.trim().length > 0 : false));
const isFieldIdChanged = computed(() => {
    if (isDefaultField.value) return true;
    return fieldId.value !== props.field.field_id;
});
const handleClickUndoFieldId = () => {
    setFieldId(props.field.field_id);
};

/* field name */
const {
    value: name, setValue: setName, resetValidation: resetNameValidation, isInvalid: isNameInvalid, validationResult: isNameValid,
} = useFieldValidator<string|undefined>('', (val?: string) => (val ? val.trim().length > 0 : false));

/* field options */
const options = ref<TaskFieldOptions>({});
const isOptionsValid = ref<boolean>(false);

/* field required */
const isRequired = ref<boolean>(false);
const handleRequiredChange = (value: boolean) => {
    isRequired.value = value;
    if (value) isPrimary.value = true;
};

/* other field properties */
const isPrimary = ref<boolean>(false);
const isFolded = ref<boolean>(false);

/* validation */
const isAllValid = computed<boolean>(() => (isDefaultField.value ? isFieldIdValid.value : true)
    && isNameValid.value
    && (optionsComponent.value ? isOptionsValid.value : true));

/* aggregated field */
const field = computed<TaskField>(() => {
    const result = {
        ...props.field,
        name: name.value ?? '',
        options: options.value,
        is_required: isRequired.value,
        is_primary: isPrimary.value,
    } as TaskField;
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
    setFieldId(props.field.field_id);
    setName(props.field.name ?? fieldMetadata.value.name);
    resetNameValidation();
    options.value = props.field.options ?? {};
    isOptionsValid.value = false;
    isRequired.value = props.field.is_required ?? isDefaultField.value;
    isPrimary.value = props.field.is_required ? true : (props.field.is_primary ?? isDefaultField.value);
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
                <p-field-group v-if="!isDefaultField"
                               :label="$t('OPSFLOW.FIELD_ID')"
                               :invalid="isFieldIdInvalid"
                               required
                >
                    <template #label-extra>
                        <info-tooltip :contents="$t('OPSFLOW.FIELD_GENERATOR.FIELD_ID_EDIT_DESC', {
                                          task: taskManagementTemplateStore.templates.task,
                                          tasks: taskManagementTemplateStore.templates.tasks,
                                      })"
                                      size="sm"
                        />
                    </template>
                    <div class="inline-flex gap-2 items-center">
                        <span>
                            <p-text-input :value="fieldId"
                                          :invalid="isFieldIdInvalid"
                                          @update:value="setFieldId"
                            />
                            <changed-mark v-if="isFieldIdChanged" />
                        </span>
                        <p-button v-if="isFieldIdChanged"
                                  size="sm"
                                  style-type="tertiary"
                                  @click="handleClickUndoFieldId"
                        >
                            Undo
                        </p-button>
                    </div>
                </p-field-group>
                <p-field-group :label="$t('OPSFLOW.FIELD_GENERATOR.FIELD_NAME')"
                               :invalid="isNameInvalid"
                               required
                >
                    <p-text-input :value="name"
                                  :placeholder="props.field.name || fieldMetadata.name"
                                  :invalid="isNameInvalid"
                                  @update:value="setName"
                    />
                </p-field-group>
                <component :is="optionsComponent"
                           :options="options"
                           @update:options="options = $event"
                           @update:is-valid="isOptionsValid = $event"
                />
                <p-field-group :label="$t('OPSFLOW.FIELD_GENERATOR.SHOW_TASK_CREATION', {task: taskManagementTemplateStore.templates.Task })"
                               required
                               class="mt-4"
                >
                    <p class="text-paragraph-sm mb-2">
                        {{ $t('OPSFLOW.FIELD_GENERATOR.SHOW_TASK_CREATION_DESC') }}
                    </p>
                    <!-- HACK: key is used to force re-render when isRequired changes. This is temporary solution. -->
                    <p-toggle-button :key="String(isRequired)"
                                     :value.sync="isPrimary"
                                     :disabled="isRequired || isDefaultField"
                                     show-state-text
                                     position="left"
                    />
                </p-field-group>
            </div>
            <div class="h-9 pl-8 flex items-center">
                <p-checkbox :selected="isRequired"
                            :value="true"
                            :disabled="isDefaultField"
                            @change="handleRequiredChange"
                >
                    {{ $t('OPSFLOW.FIELD_GENERATOR.FIELD_REQUIRED') }}
                </p-checkbox>
            </div>
        </div>
    </div>
</template>
