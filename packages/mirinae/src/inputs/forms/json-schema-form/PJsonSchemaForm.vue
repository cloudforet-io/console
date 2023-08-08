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
                                               :items="schemaProperty.menuItems"
                                               :disabled="schemaProperty.disabled"
                                               :use-fixed-menu-style="useFixedMenuStyle"
                                               :button-text-ellipsis="uniformWidth"
                                               is-fixed-width
                                               class="input-form select-dropdown"
                                               @update:selected="handleUpdateFormValue(schemaProperty, propertyIdx, $event)"
                            >
                                <template #default="{ item }">
                                    <slot name="dropdown-extra"
                                          v-bind="{...schemaProperty, selectedItem: item }"
                                    />
                                </template>
                            </p-select-dropdown>
                            <p-filterable-dropdown v-else-if="schemaProperty.componentName === 'PFilterableDropdown'"
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
                                                   class="input-form"
                                                   @update:selected="handleUpdateFormValue(schemaProperty, propertyIdx, $event)"
                            >
                                <template #selected-extra="{ item }">
                                    <slot name="dropdown-extra"
                                          v-bind="{...schemaProperty, selectedItem: item}"
                                    />
                                </template>
                            </p-filterable-dropdown>
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
import { isEmpty } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';

import PMarkdown from '@/data-display/markdown/PMarkdown.vue';
import PFilterableDropdown from '@/inputs/dropdown/filterable-dropdown/PFilterableDropdown.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import GenerateIdFormat from '@/inputs/forms/json-schema-form/components/GenerateIdFormat.vue';
import { useLocalize } from '@/inputs/forms/json-schema-form/composables/localize';
import { useValidation } from '@/inputs/forms/json-schema-form/composables/validation';
import { addCustomFormats, addCustomKeywords } from '@/inputs/forms/json-schema-form/custom-schema';
import {
    getAppearanceType,
    getComponentNameBySchemaProperty,
    getInputPlaceholderBySchemaProperty,
    getInputTypeBySchemaProperty,
    getMenuItemsBySchemaProperty,
    getMultiInputMode,
    getReferenceHandler,
    getUseAutoComplete,
    initFormDataWithSchema,
    initJsonInputDataWithSchema,
    initRefinedFormData,
    refineObjectByProperties,
    refineValueByProperty,
} from '@/inputs/forms/json-schema-form/helper';
import type {
    InnerJsonSchema,
    JsonSchema,
    JsonSchemaFormProps, ReferenceHandler,
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
    schemaProperties: computed<InnerJsonSchema[]>(() => {
        const properties: object|undefined = props.schema?.properties;
        const order: string[] = props.schema?.order ?? [];
        if (properties && !isEmpty(properties)) {
            return Object.entries(properties).map(([k, schemaProperty]) => {
                const refined: InnerJsonSchema = {
                    ...schemaProperty,
                    propertyName: k,
                    componentName: getComponentNameBySchemaProperty(schemaProperty),
                    inputType: getInputTypeBySchemaProperty(schemaProperty),
                    inputPlaceholder: getInputPlaceholderBySchemaProperty(schemaProperty),
                    menuItems: getMenuItemsBySchemaProperty(schemaProperty),
                    multiInputMode: getMultiInputMode(schemaProperty),
                    useAutoComplete: getUseAutoComplete(schemaProperty),
                    appearanceType: getAppearanceType(schemaProperty),
                    referenceHandler: getReferenceHandler(schemaProperty, props as JsonSchemaFormProps),
                };
                return refined;
            }).sort((a, b) => {
                const orderA = order.findIndex((propertyName) => propertyName === a.propertyName);
                const orderB = order.findIndex((propertyName) => propertyName === b.propertyName);

                // If both do not have order information, they are sorted based on title or property name.
                if (orderA === -1 && orderB === -1) {
                    const textA = a.title ?? a.propertyName;
                    const textB = b.title ?? b.propertyName;
                    return textA.localeCompare(textB);
                }

                // If only one of them does not have order information, the item without order information is placed at the back.
                if (orderA === -1) return 1;
                if (orderB === -1) return -1;

                // If both have order information, sort based on the order information.
                return orderA - orderB;
            });
        }
        return [];
    }),
    requiredList: computed<string[]>(() => props.schema?.required ?? []),
    // For form input case
    rawFormData: initFormDataWithSchema(props.schema, props.formData as object) as object,
    // For json input case
    jsonInputData: initJsonInputDataWithSchema(props.schema, props.formData as object) as string|undefined,
    // For all cases. In root case, it can be only an object.
    refinedFormData: initRefinedFormData(props.schema, props.formData, props.isRoot) as any,
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

const initFormData = () => {
    if (state.isJsonInputMode) state.jsonInputData = initJsonInputDataWithSchema(props.schema, props.formData as object);
    else state.rawFormData = initFormDataWithSchema(props.schema, props.formData as object);

    if (props.isRoot) state.refinedFormData = initRefinedFormData(props.schema, props.formData);
};
const reset = () => {
    initFormData();
    validatorErrors.value = null;
    inputOccurredMap.value = {};
    jsonInputOccurred.value = false;
};


/* Event Handlers */
// form input case
const handleUpdateFormValue = (property: InnerJsonSchema, propertyIdx: number, val?: any) => {
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

/* Watchers */
watch(() => props.schema, () => {
    if (props.resetOnSchemaChange) reset();
});
watch(() => props.formData, (formData) => {
    if (formData === state.refinedFormData) return;
    initFormData();
});
watch(() => state.refinedFormData, (refinedFormData) => {
    emit('update:form-data', refinedFormData);
    if (props.isRoot) {
        const isValid = validateFormData();
        emit('validate', isValid);
        emit('change', isValid, refinedFormData);
    }
}, { immediate: !state.isJsonInputMode });

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
