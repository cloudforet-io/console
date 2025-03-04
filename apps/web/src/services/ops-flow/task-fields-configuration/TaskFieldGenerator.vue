<script setup lang="ts">
import {
    defineAsyncComponent, computed, onBeforeMount, ref, watch,
} from 'vue';

import { isEqual, cloneDeep } from 'lodash';

import {
    PFieldGroup, PTextInput, PToggleButton, PCheckbox, PButton, PSelectButton, PCodeEditor,
} from '@cloudforet/mirinae';

import type {
    TaskField,
    TaskFieldOptions,
    TaskFieldType,
} from '@/api-clients/opsflow/_types/task-field-type';
import { getParticle, i18n } from '@/translations';

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
import type {
    MutableTaskField,
    OptionalMutableTaskField,
} from '@/services/ops-flow/task-fields-configuration/types/mutable-task-field-type';
import type { DefaultTaskFieldId, TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const COMPONENT_MAP: Partial<Record<TaskFieldType, ReturnType<typeof defineAsyncComponent>>> = {
    DROPDOWN: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generator-templates/DropdownOptionsGenerator.vue')),
    PARAGRAPH: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generator-templates/ParagraphOptionsGenerator.vue')),
    TEXT: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/options-generator-templates/TextOptionsGenerator.vue')),
};

const props = defineProps<{
    field: OptionalMutableTaskField; // _field_id is optional because it is only required for editable case.
    allFields: OptionalMutableTaskField[];
    editable?: boolean;
}>();
const emit = defineEmits<{(event: 'delete'): void;
    (event: 'update:field', value: MutableTaskField): void; // _field_id is required only for editable case.
    (event: 'update:is-valid', value: boolean): void;
}>();

const taskFieldMetadataStore = useTaskFieldMetadataStore();
const taskFieldMetadataStoreGetters = taskFieldMetadataStore.getters;
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const fieldMetadata = computed<TaskFieldTypeMetadata>(() => taskFieldMetadataStoreGetters.taskFieldTypeMetadataMap[props.field.field_type]);
const optionsComponent = computed<ReturnType<typeof defineAsyncComponent>|undefined>(() => COMPONENT_MAP[props.field.field_type]);

const isDefaultField = computed(() => Object.values(DEFAULT_FIELD_ID_MAP).includes(props.field.field_id as DefaultTaskFieldId));

/* input type */
const inputTypes = computed<{ name: string; label: string; }[]>(() => [
    { name: 'form', label: i18n.t('OPSFLOW.FIELD_GENERATOR.FORM') as string },
    { name: 'json', label: i18n.t('OPSFLOW.FIELD_GENERATOR.JSON') as string },
]);
const inputType = ref<string>('form');
const handleChangeInputType = (value: string) => {
    if (value === 'json') {
        const taskField = cloneDeep(field.value);
        delete taskField._field_id; // remove hidden field id from json so that it can not be modified
        jsonCode.value = JSON.stringify(taskField);
    } else {
        applyJsonCodeToStates(jsonCode.value);
    }
    inputType.value = value;
};
/* field id */
const {
    value: fieldId, setValue: setFieldId, isInvalid: isFieldIdInvalid, validationResult: isFieldIdValid, invalidText: fieldIdInvalidText,
} = useFieldValidator<string|undefined>('', (val?: string) => {
    if (!val?.trim()) {
        return i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
            topic: i18n.t('OPSFLOW.FIELD_ID', { field: i18n.t('OPSFLOW.FIELD_GENERATOR.FIELD') }),
            particle: getParticle(i18n.t('OPSFLOW.FIELD_ID', { field: i18n.t('OPSFLOW.FIELD_GENERATOR.FIELD') }) as string, 'topic'),
        });
    }
    if (props.allFields.some((f) => {
        const id = f._field_id || f.field_id; // some fields do not have _field_id because they are not editable.
        return id === val && id !== props.field._field_id;
    })) {
        return i18n.t('OPSFLOW.VALIDATION.DUPLICATED', {
            field: i18n.t('OPSFLOW.FIELD_ID', { field: i18n.t('OPSFLOW.FIELD_GENERATOR.FIELD') }),
        });
    }
    return true;
});
const isFieldIdChanged = computed(() => {
    if (!props.editable) return true;
    return fieldId.value !== props.field._field_id;
});
const handleClickUndoFieldId = () => {
    setFieldId(props.field._field_id);
};

/* field name */
const {
    value: name, setValue: setName, resetValidation: resetNameValidation, isInvalid: isNameInvalid, invalidText: nameInvalidText, validationResult: isNameValid,
} = useFieldValidator<string|undefined>('', (val?: string) => {
    if (!val?.trim()) {
        return i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
            topic: i18n.t('OPSFLOW.FIELD_NAME', { field: i18n.t('OPSFLOW.FIELD_GENERATOR.FIELD') }),
            particle: getParticle(i18n.t('OPSFLOW.FIELD_NAME', { field: i18n.t('OPSFLOW.FIELD_GENERATOR.FIELD') }) as string, 'topic'),
        });
    }
    return true;
});

/* field options */
const options = ref<TaskFieldOptions>({});
const isOptionsValid = ref<boolean>(false);
const optionsInvalidText = ref<string>('');
const handleUpdateOptions = (value: TaskFieldOptions) => {
    options.value = value;
};
const handleUpdateOptionsValidation = (isValid: boolean, invalidText: string) => {
    isOptionsValid.value = isValid;
    optionsInvalidText.value = invalidText;
};

/* field required */
const isRequired = ref<boolean>(false);
const handleRequiredChange = (value: boolean) => {
    isRequired.value = value;
    if (value) isPrimary.value = true;
};

/* other field properties */
const isPrimary = ref<boolean>(true);
const isFolded = ref<boolean>(false);

/* validation */
const isAllValid = computed<boolean>(() => (props.editable ? isFieldIdValid.value : true)
    && isNameValid.value
    && (optionsComponent.value ? isOptionsValid.value : true));


/* aggregated field */
const field = computed<OptionalMutableTaskField>(() => {
    const result = {
        ...props.field,
        field_id: fieldId.value,
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

/* json */
const jsonCode = ref<string>('');
const jsonInvalidText = computed<string>(() => {
    const allInvalidTexts: string[] = [];
    if (fieldIdInvalidText.value) allInvalidTexts.push(fieldIdInvalidText.value as string);
    if (nameInvalidText.value) allInvalidTexts.push(nameInvalidText.value as string);
    // NOTE: options invalid text is not shown in json mode yet, because validation is executed in option components and the component is not rendered in json mode.
    // if (optionsComponent.value && !isOptionsValid.value) allInvalidTexts.push(optionsInvalidText.value);
    if (isRequired.value && !isPrimary.value) allInvalidTexts.push(i18n.t('OPSFLOW.VALIDATION.PRIMARY_FIELD_REQUIRED') as string);
    return allInvalidTexts.join('\n');
});
const applyJsonCodeToStates = (code: string) => {
    let obj;
    try {
        obj = JSON.parse(code);
    } catch (e) {
        return;
    }
    setFieldId(obj.field_id);
    setName(obj.name);
    options.value = obj.options;
    isRequired.value = obj.is_required;
    isPrimary.value = obj.is_primary;
    isFolded.value = false;
};
const handleUpdateJsonCode = (code: string) => {
    jsonCode.value = code;
    applyJsonCodeToStates(code);
};


watch(field, (newField) => {
    if (isEqual(newField, props.field)) return;
    emit('update:field', newField as MutableTaskField);
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
    isPrimary.value = props.field.is_primary ?? true;
    isFolded.value = isDefaultField.value;
    jsonCode.value = JSON.stringify(props.field);
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
            <div class="py-4 pl-8 pr-2 border-gray-150"
                 :class="{ 'border-b': inputType === 'form' }"
            >
                <div v-if="props.editable"
                     class="float-right flex justify-end gap-1 mb-4"
                >
                    <template v-for="type in inputTypes">
                        <p-select-button :key="type.name"
                                         size="sm"
                                         style-type="gray"
                                         :value="type.name"
                                         :selected="inputType"
                                         @change="handleChangeInputType"
                        >
                            {{ type.label }}
                        </p-select-button>
                    </template>
                </div>
                <template v-if="inputType === 'form'">
                    <p-field-group v-if="props.editable"
                                   :label="$t('OPSFLOW.FIELD_ID', {field: $t('OPSFLOW.FIELD_GENERATOR.FIELD')})"
                                   :invalid="isFieldIdInvalid"
                                   :invalid-text="fieldIdInvalidText"
                                   required
                    >
                        <template #label-extra>
                            <info-tooltip :contents="String($t('OPSFLOW.FIELD_GENERATOR.FIELD_ID_EDIT_DESC', {
                                              task: taskManagementTemplateStore.templates.task,
                                              tasks: taskManagementTemplateStore.templates.tasks,
                                          }))"
                                          size="sm"
                            />
                        </template>
                        <div class="inline-flex gap-2 items-center">
                            <span>
                                <p-text-input :value="fieldId"
                                              :invalid="isFieldIdInvalid"
                                              :readonly="!props.editable"
                                              @update:value="setFieldId"
                                />
                                <changed-mark v-if="isFieldIdChanged" />
                            </span>
                            <p-button v-if="isFieldIdChanged"
                                      size="sm"
                                      style-type="tertiary"
                                      @click="handleClickUndoFieldId"
                            >
                                {{ $t('OPSFLOW.FIELD_GENERATOR.UNDO') }}
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
                                      :readonly="!props.editable"
                                      @update:value="setName"
                        />
                    </p-field-group>
                    <component :is="optionsComponent"
                               :options="options"
                               :editable="props.editable"
                               @update:options="handleUpdateOptions"
                               @update:is-valid="handleUpdateOptionsValidation"
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
                                         :disabled="isRequired || !props.editable"
                                         show-state-text
                                         position="left"
                        />
                    </p-field-group>
                </template>
                <template v-else>
                    <p-code-editor :code="jsonCode"
                                   @update:code="handleUpdateJsonCode"
                    />
                    <p v-if="jsonInvalidText"
                       class="mt-1 text-label-sm text-alert whitespace-pre"
                    >
                        {{ jsonInvalidText }}
                    </p>
                </template>
            </div>
            <div v-if="inputType === 'form'"
                 class="h-9 pl-8 flex items-center"
            >
                <p-checkbox :selected="isRequired"
                            :value="true"
                            :disabled="!props.editable"
                            @change="handleRequiredChange"
                >
                    {{ $t('OPSFLOW.FIELD_GENERATOR.FIELD_REQUIRED') }}
                </p-checkbox>
            </div>
        </div>
    </div>
</template>
