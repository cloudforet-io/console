<template>
    <form class="p-json-schema-form" @submit.prevent>
        <p-field-group v-for="schemaProperty in schemaProperties"
                       :key="`field-${contextKey}-${schemaProperty.id}`"
                       class="input-form-wrapper"
                       :label="schemaProperty.title"
                       :required="requiredList.includes(schemaProperty.id)"
                       :invalid="getPropertyInvalidState(schemaProperty)"
                       :invalid-text="invalidMessages[schemaProperty.id]"
        >
            <template v-if="schemaProperty.markdown" #help>
                <p-markdown :markdown="schemaProperty.markdown" :language="language" remove-spacing />
            </template>
            <template #default="{invalid}">
                <generate-id-format v-if="schemaProperty.componentName === 'GenerateIdFormat'"
                                    :value="rawFormData[schemaProperty.id]"
                                    :disabled="schemaProperty.disabled"
                                    @update:value="handleUpdateValue(schemaProperty, ...arguments)"
                />
                <p-text-editor v-else-if="schemaProperty.componentName === 'PTextEditor'"
                               :code="rawFormData[schemaProperty.id]"
                               disable-auto-reformat
                               :read-only="schemaProperty.disabled"
                               @update:code="handleUpdateValue(schemaProperty, ...arguments)"
                />
                <p-select-dropdown v-else-if="schemaProperty.componentName === 'PSelectDropdown'"
                                   :selected="rawFormData[schemaProperty.id]"
                                   :items="schemaProperty.menuItems"
                                   :disabled="schemaProperty.disabled"
                                   @update:selected="handleUpdateValue(schemaProperty, ...arguments)"
                />
                <p-text-input v-else
                              :value="rawFormData[schemaProperty.id]"
                              :type="schemaProperty.inputType"
                              :invalid="invalid"
                              :placeholder="schemaProperty.inputPlaceholder"
                              :masking-mode="schemaProperty.inputType === 'password'"
                              :autocomplete="false"
                              :disabled="schemaProperty.disabled"
                              @update:value="handleUpdateValue(schemaProperty, ...arguments)"
                />
            </template>
        </p-field-group>
    </form>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { isEmpty } from 'lodash';

import PMarkdown from '@/data-display/markdown/PMarkdown.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import GenerateIdFormat from '@/inputs/forms/new-json-schema-form/components/GenerateIdFormat.vue';
import { useLocalize } from '@/inputs/forms/new-json-schema-form/composables/localize';
import { useValidation } from '@/inputs/forms/new-json-schema-form/composables/validation';
import { addCustomFormats, addCustomKeywords } from '@/inputs/forms/new-json-schema-form/custom-schema';
import type { RawValue, RefinedValue } from '@/inputs/forms/new-json-schema-form/helper';
import {
    getComponentNameBySchemaProperty,
    getInputPlaceholderBySchemaProperty,
    getInputTypeBySchemaProperty, getMenuItemsBySchemaProperty,
    initFormDataWithSchema,
    refineValueByProperty,
} from '@/inputs/forms/new-json-schema-form/helper';
import type {
    InnerJsonSchema,
    JsonSchema,
    JsonSchemaFormProps,
    ValidationMode,
} from '@/inputs/forms/new-json-schema-form/type';
import { VALIDATION_MODES } from '@/inputs/forms/new-json-schema-form/type';
import PTextInput from '@/inputs/input/PTextInput.vue';
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';
import type { SupportLanguage } from '@/translations';
import { supportLanguages } from '@/translations';

export default defineComponent<JsonSchemaFormProps>({
    name: 'PJsonSchemaForm',
    components: {
        PSelectDropdown,
        PTextEditor,
        GenerateIdFormat,
        PMarkdown,
        PFieldGroup,
        PTextInput,
    },
    props: {
        schema: {
            type: Object as PropType<JsonSchema>,
            default: undefined,
        },
        formData: {
            type: Object,
            default: undefined,
        },
        language: {
            type: String as PropType<SupportLanguage>,
            default: 'en',
            validator(lang?: SupportLanguage) {
                return lang === undefined || supportLanguages.includes(lang);
            },
        },
        validationMode: {
            type: String as PropType<ValidationMode>,
            default: 'input',
            validator(mode?: ValidationMode) {
                return mode === undefined || VALIDATION_MODES.includes(mode);
            },
        },
    },
    setup(props, { emit }) {
        const ajv = new Ajv({
            allErrors: true,
            strict: false,
        });
        addFormats(ajv);
        addCustomFormats(ajv);
        addCustomKeywords(ajv);

        const state = reactive({
            schemaProperties: computed<InnerJsonSchema[]>(() => {
                const properties: object|undefined = props.schema?.properties;
                const order: string[] = props.schema?.order ?? [];
                if (properties && !isEmpty(properties)) {
                    return Object.entries(properties).map(([k, schemaProperty]) => {
                        const refined: InnerJsonSchema = {
                            ...schemaProperty,
                            id: k,
                            componentName: getComponentNameBySchemaProperty(schemaProperty),
                            inputType: getInputTypeBySchemaProperty(schemaProperty),
                            inputPlaceholder: getInputPlaceholderBySchemaProperty(schemaProperty),
                            menuItems: getMenuItemsBySchemaProperty(schemaProperty),
                        };
                        return refined;
                    }).sort((a, b) => {
                        const orderA = order.findIndex(id => id === a.id);
                        const orderB = order.findIndex(id => id === b.id);

                        // If both do not have order information, they are sorted based on title or id(=property name).
                        if (orderA === -1 && orderB === -1) {
                            const textA = a.title ?? a.id;
                            const textB = b.title ?? b.id;
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
            rawFormData: initFormDataWithSchema(props.schema, props.formData) as object,
            refinedFormData: initFormDataWithSchema(props.schema, props.formData, true) as Record<string, RefinedValue>,
            contextKey: Math.floor(Math.random() * Date.now()),
        });

        const { localize } = useLocalize(props);
        const {
            invalidMessages, validatorErrors, inputOccurred,
            validateFormData, getPropertyInvalidState,
        } = useValidation(props, {
            ajv,
            formData: computed(() => state.refinedFormData),
            localize,
        });

        const initFormData = () => {
            state.rawFormData = initFormDataWithSchema(props.schema, props.formData);
            state.refinedFormData = initFormDataWithSchema(props.schema, props.formData, true) as Record<string, RefinedValue>;
        };
        const reset = () => {
            initFormData();
            validatorErrors.value = null;
            inputOccurred.value = {};
        };

        /* Event Handlers */
        const handleUpdateValue = (property: InnerJsonSchema, val?: RawValue) => {
            const { id } = property;
            state.rawFormData[id] = val;
            state.refinedFormData = { ...state.refinedFormData, [id]: refineValueByProperty(property, val) };
            const isValid = validateFormData();
            emit('update:form-data', state.refinedFormData);
            emit('validate', isValid);
            emit('change', isValid, state.refinedFormData);
            if (!inputOccurred.value[id]) inputOccurred.value[id] = true;
        };

        /* Watchers */
        watch(() => props.schema, () => {
            state.contextKey = Math.floor(Math.random() * Date.now());
            reset();
        });
        watch(() => props.formData, (formData) => {
            if (formData === state.refinedFormData) return;
            initFormData();
        });
        watch(() => state.refinedFormData, () => {
            const isValid = validateFormData();
            emit('update:form-data', state.refinedFormData);
            emit('validate', isValid);
            emit('change', isValid, state.refinedFormData);
        }, { immediate: true });

        return {
            ...toRefs(state),
            invalidMessages,
            getPropertyInvalidState,
            handleUpdateValue,
        };
    },
});
</script>
