<template>
    <form class="p-json-schema-form"
          :class="{'uniform-width': uniformWidth}"
          @submit.prevent
    >
        <p-field-group v-if="state.isJsonInputMode"
                       class="input-form-wrapper"
                       :class="{'no-margin': !isRoot}"
                       :invalid="getJsonInputInvalidState()"
        >
            <p-text-editor :code="state.jsonInputData"
                           disable-auto-reformat
                           :read-only="schema.disabled"
                           @update:code="handleUpdateJsonData(schema, $event)"
            />
            <template #invalid>
                <span v-for="invalidMessage in invalidMessages"
                      :key="invalidMessage"
                      class="invalid-message"
                >
                    {{ invalidMessage }}
                </span>
            </template>
        </p-field-group>
        <template v-else-if="typeof state.rawFormData === 'object'">
            <p-field-group v-for="(schemaProperty, propertyIdx) in state.schemaProperties"
                           :key="`field-${schemaProperty.propertyName}`"
                           class="input-form-wrapper"
                           :label="schemaProperty.title"
                           :required="state.requiredList.includes(schemaProperty.propertyName)"
                           :invalid="getPropertyInvalidState(schemaProperty)"
            >
                <template #label-extra>
                    <slot name="label-extra"
                          v-bind="schemaProperty"
                    />
                </template>
                <template v-if="schemaProperty.markdown"
                          #help
                >
                    <p-markdown :markdown="schemaProperty.markdown"
                                :language="language"
                                remove-spacing
                    />
                </template>
                <template v-if="invalidMessagesMap[schemaProperty.propertyName]"
                          #invalid
                >
                    <span v-for="invalidMessage in invalidMessagesMap[schemaProperty.propertyName]"
                          :key="invalidMessage"
                          class="invalid-message"
                    >
                        {{ invalidMessage }}
                    </span>
                </template>
                <template #default="{invalid}">
                    <div class="field-group-default-wrapper">
                        <div class="input-wrapper">
                            <generate-id-format v-if="schemaProperty.componentName === 'GenerateIdFormat'"
                                                :key="`GenerateIdFormat-${schemaProperty.propertyName}`"
                                                :value="state.rawFormData[schemaProperty.propertyName]"
                                                :disabled="schemaProperty.disabled"
                                                :invalid="invalid"
                                                :full-width="uniformWidth"
                                                class="input-form"
                                                @update:value="handleUpdateFormValue(schemaProperty, propertyIdx, $event)"
                            />
                            <p-json-schema-form v-else-if="schemaProperty.componentName === 'PJsonSchemaForm'"
                                                :key="`PJsonSchemaForm-${schemaProperty.propertyName}`"
                                                :form-data="state.rawFormData[schemaProperty.propertyName]"
                                                :schema="schemaProperty"
                                                :is-root="false"
                                                @update:form-data="handleUpdateFormValue(schemaProperty, propertyIdx, $event)"
                            />
                            <p-select-dropdown v-else-if="schemaProperty.componentName === 'PSelectDropdown'"
                                               :key="`PSelectDropdown-${schemaProperty.propertyName}`"
                                               :selected="state.rawFormData[schemaProperty.propertyName]"
                                               :menu="schemaProperty.menuItems"
                                               :disabled="schemaProperty.disabled"
                                               :use-fixed-menu-style="useFixedMenuStyle"
                                               is-fixed-width
                                               class="input-form"
                                               @update:selected="handleUpdateFormValue(schemaProperty, propertyIdx, $event)"
                            >
                                <template #dropdown-button="item">
                                    <slot name="dropdown-extra"
                                          v-bind="{...schemaProperty, selectedItem: item }"
                                    />
                                </template>
                            </p-select-dropdown>
                            <p-select-dropdown v-else-if="schemaProperty.componentName === 'PFilterableDropdown'"
                                               :key="`PFilterableDropdown-${schemaProperty.propertyName}`"
                                               :menu="schemaProperty.menuItems"
                                               :selected="state.rawFormData[schemaProperty.propertyName]"
                                               :multi-selectable="schemaProperty.multiInputMode"
                                               :appearance-type="schemaProperty.appearanceType"
                                               :page-size="10"
                                               show-select-marker
                                               :use-fixed-menu-style="useFixedMenuStyle"
                                               :invalid="invalid"
                                               :handler="schemaProperty.referenceHandler"
                                               is-filterable
                                               is-fixed-width
                                               class="input-form"
                                               @update:selected="handleUpdateFormValue(schemaProperty, propertyIdx, ...arguments)"
                            >
                                <template #selected-extra="{ item }">
                                    <slot name="dropdown-extra"
                                          v-bind="{...schemaProperty, selectedItem: item}"
                                    />
                                </template>
                            </p-select-dropdown>
                            <template v-else>
                                <p-text-input :key="`PTextInput-${schemaProperty.propertyName}`"
                                              :value="schemaProperty.multiInputMode ? undefined : state.rawFormData[schemaProperty.propertyName]"
                                              :selected="schemaProperty.multiInputMode ? state.rawFormData[schemaProperty.propertyName] : undefined"
                                              :type="schemaProperty.inputType"
                                              :invalid="invalid"
                                              :menu="schemaProperty.menuItems"
                                              :placeholder="schemaProperty.inputPlaceholder"
                                              :appearance-type="schemaProperty.appearanceType"
                                              :autocomplete="false"
                                              :use-auto-complete="schemaProperty.useAutoComplete"
                                              :use-fixed-menu-style="useFixedMenuStyle"
                                              :disabled="schemaProperty.disabled"
                                              :multi-input="schemaProperty.multiInputMode"
                                              :page-size="10"
                                              class="input-form"
                                              @update:value="!schemaProperty.multiInputMode && handleUpdateFormValue(schemaProperty, propertyIdx, $event)"
                                              @update:selected="schemaProperty.multiInputMode && handleUpdateFormValue(schemaProperty, propertyIdx, $event)"
                                />
                            </template>
                        </div>
                        <slot name="input-extra"
                              v-bind="schemaProperty"
                        />
                    </div>
                </template>
            </p-field-group>
        </template>
    </form>
</template>

<script setup lang="ts">
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { isEqual } from 'lodash';
import {
    computed, onBeforeUnmount, reactive, watch,
} from 'vue';

import PMarkdown from '@/data-display/markdown/PMarkdown.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import GenerateIdFormat from '@/inputs/forms/json-schema-form/components/GenerateIdFormat.vue';
import { useLocalize } from '@/inputs/forms/json-schema-form/composables/localize';
import { useValidation } from '@/inputs/forms/json-schema-form/composables/validation';
import { addCustomFormats, addCustomKeywords } from '@/inputs/forms/json-schema-form/custom-schema';
import {
    initRefinedFormData, refineObjectByProperties, refineValueByProperty,
} from '@/inputs/forms/json-schema-form/helpers/form-data-refine-helper';
import { getSchemaProperties } from '@/inputs/forms/json-schema-form/helpers/inner-schema-helper';
import { initJsonInputDataWithSchema } from '@/inputs/forms/json-schema-form/helpers/json-input-helper';
import { initRawFormDataWithSchema, updateRawFormDataWithSchema } from '@/inputs/forms/json-schema-form/helpers/raw-form-data-helper';
import type {
    InnerJsonSchema,
    JsonSchema,
    JsonSchemaFormProps,
    ReferenceHandler,
    ValidationMode,
    CustomErrorMap,
} from '@/inputs/forms/json-schema-form/type';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';
import type { SupportLanguage } from '@/translations';

const PJsonSchemaForm = () => ({
    // eslint-disable-next-line import/no-self-import
    component: import('./PJsonSchemaForm.vue'),
});

interface Props {
    schema: JsonSchema;
    formData: any;
    language: SupportLanguage;
    validationMode: ValidationMode;
    isRoot: boolean;
    resetOnSchemaChange: boolean;
    customErrorMap: CustomErrorMap;
    referenceHandler?: ReferenceHandler;
    useFixedMenuStyle: boolean;
    uniformWidth: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    formData: undefined,
    language: 'en',
    validationMode: 'input',
    isRoot: true,
    resetOnSchemaChange: false,
    customErrorMap: () => ({}),
    referenceHandler: undefined,
    useFixedMenuStyle: false,
    uniformWidth: false,
});
const emit = defineEmits(['update:form-data', 'validate', 'change']);

const ajv = new Ajv({
    allErrors: true,
    strict: false,
});
addFormats(ajv);
addCustomFormats(ajv);
addCustomKeywords(ajv);

const state = reactive({
    isJsonInputMode: computed(() => props.schema?.json),
    requiredList: computed<string[]>(() => props.schema?.required ?? []),
    // refined schema properties to bind props to components
    schemaProperties: [] as InnerJsonSchema[],
    // For form input case
    rawFormData: {} as object,
    // For json input case
    jsonInputData: undefined as string|undefined,
    // For all cases. In root case, it can be only an object.
    refinedFormData: {} as any,
    unmounting: false,
});

const { localize } = useLocalize(props as JsonSchemaFormProps);
const {
    invalidMessagesMap, validatorErrors, inputOccurredMap, invalidMessages, jsonInputOccurred,
    validateFormData, getPropertyInvalidState, getJsonInputInvalidState, setJsonInputParsingError,
} = useValidation(props as JsonSchemaFormProps, {
    ajv,
    formData: computed(() => (props.isRoot ? state.refinedFormData : props.formData)),
    localize,
    customErrorMap: computed(() => props.customErrorMap),
});

const initSchemaAndData = async () => {
    let jsonInputData: string|undefined;
    let rawFormData: object|undefined;
    let refined: any;

    if (state.isJsonInputMode) {
        jsonInputData = initJsonInputDataWithSchema(props.schema, props.formData);
        if (props.isRoot) refined = initRefinedFormData(props.schema, props.formData, props.isRoot);
    } else {
        rawFormData = await initRawFormDataWithSchema(props.schema, props.formData, props.referenceHandler);
        refined = initRefinedFormData(props.schema, rawFormData, props.isRoot);
    }

    // CAUTION: states should be updated together after all async operations are done.
    state.schemaProperties = getSchemaProperties(props.schema, props.referenceHandler);
    if (jsonInputData !== undefined) state.jsonInputData = jsonInputData;
    if (rawFormData !== undefined) state.rawFormData = rawFormData;
    if (refined !== undefined) state.refinedFormData = refined;
};
const updateFormData = async (schema: JsonSchema, prevSchema: JsonSchema) => {
    const [rawFormData, newInputOccurredMap] = await updateRawFormDataWithSchema(schema, prevSchema, state.rawFormData, inputOccurredMap.value, props.referenceHandler);

    let refined: any;
    if (props.isRoot) {
        refined = initRefinedFormData(schema, rawFormData, props.isRoot);
    }

    // CAUTION: states should be updated together after all async operations are done.
    state.schemaProperties = getSchemaProperties(schema, props.referenceHandler);
    state.rawFormData = rawFormData;
    inputOccurredMap.value = newInputOccurredMap;
    if (refined !== undefined) state.refinedFormData = refined;
};
const reset = async () => {
    await initSchemaAndData();
    validatorErrors.value = null;
    inputOccurredMap.value = {};
    jsonInputOccurred.value = false;
};


/* Event Handlers */
// form input case
const handleUpdateFormValue = (property: InnerJsonSchema, propertyIdx: number, val?: any) => {
    if (state.unmounting) return;

    const { propertyName, componentName } = property;

    /*
            If the schema is changed, the component to which rawFormData is bound may change.
            Don't handle events from other components and return early.
             */
    if (!state.schemaProperties[propertyIdx] || state.schemaProperties[propertyIdx].componentName !== componentName) return;

    state.rawFormData[propertyName] = val;
    state.refinedFormData = {
        ...state.refinedFormData,
        [propertyName]: refineValueByProperty(property, val),
    };
    if (!inputOccurredMap.value[propertyName]) inputOccurredMap.value[propertyName] = true;
};
// json input case
const handleUpdateJsonData = (property: JsonSchema, code?: string) => {
    // The code below is to prevent updating jsonInputOccurred on initializing case. TextEditor component emit update:code event on initialize.
    if (!jsonInputOccurred.value && state.jsonInputData !== code) {
        jsonInputOccurred.value = true;
    }
    state.jsonInputData = code;
    const trimmed = code?.trim();
    let jsonParsingError: null|Error = null;

    if (!trimmed) state.refinedFormData = undefined;
    else {
        try {
            const parsed = JSON.parse(trimmed);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                state.refinedFormData = refineObjectByProperties(property, parsed);
            } else {
                state.refinedFormData = props.isRoot ? {} : parsed;
            }
        } catch (e: unknown) {
            jsonParsingError = e as Error;
            if (!props.isRoot) state.refinedFormData = trimmed;
        }
    }

    if (props.isRoot) setJsonInputParsingError(jsonParsingError);
};

(async () => {
    await initSchemaAndData();
})();

/* Watchers */
watch([() => props.schema, () => props.formData], async ([schema, formData], [prevSchema, prevFormData]) => {
    if (isEqual(schema, prevSchema)) {
        if (isEqual(formData, prevFormData)) return;
        if (isEqual(formData, state.refinedFormData)) return;
    } else if (props.resetOnSchemaChange || state.isJsonInputMode) {
        await reset();
        return;
    }

    await updateFormData(schema, prevSchema);
});
const stopWatch = watch(() => state.refinedFormData, (refinedFormData) => {
    emit('update:form-data', refinedFormData);
    if (props.isRoot) {
        const isValid = validateFormData();
        emit('validate', isValid);
        emit('change', isValid, refinedFormData);
    }
}, { immediate: !state.isJsonInputMode });

onBeforeUnmount(() => {
    stopWatch();
    state.unmounting = true;
});
</script>

<style lang="postcss">
.p-json-schema-form {
    .input-form-wrapper {
        &.no-margin {
            margin-bottom: 0;
        }
    }
    .field-group-default-wrapper {
        @apply flex;
        > .input-wrapper {
            flex-grow: 1;
        }
    }
    .invalid-message {
        display: block;
        margin-bottom: 0.25rem;
        &:last-of-type {
            margin-bottom: 0;
        }
    }
    &.uniform-width {
        .field-group-default-wrapper > .input-wrapper > .input-form {
            width: 100%;
        }
    }
}
</style>
