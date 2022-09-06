<template>
    <form class="p-json-schema-form">
        <p-field-group v-for="schemaProperty in schemaProperties"
                       :key="`field-${contextKey}-${schemaProperty.id}`"
                       class="input-form-wrapper"
                       :label="schemaProperty.title"
                       :required="requiredList.includes(schemaProperty.id)"
                       :invalid="getPropertyInvalidState(schemaProperty)"
                       :invalid-text="invalidMessages[schemaProperty.id]"
        >
            <template #default="{invalid}">
                <p-text-input v-if="TEXT_INPUT_TYPES.includes(schemaProperty.inputType)"
                              :value="proxyFormData[schemaProperty.id]"
                              :type="schemaProperty.inputType"
                              :invalid="invalid"
                              :placeholder="schemaProperty.inputPlaceholder"
                              :masking-mode="schemaProperty.inputType === 'password'"
                              autocomplete="off"
                              @input="handleTextInput(schemaProperty, ...arguments)"
                />
            </template>
        </p-field-group>
    </form>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { isEmpty } from 'lodash';

import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import {
    getInputPlaceholderBySchemaProperty,
    getInputTypeBySchemaProperty,
    initFormDataWithSchema,
    refineValueByProperty,
} from '@/inputs/forms/new-json-schema-form/helper';
import { useLocalize } from '@/inputs/forms/new-json-schema-form/localize';
import type {
    InnerJsonSchema,
    JsonSchema,
    JsonSchemaFormProps,
    ValidationMode,
} from '@/inputs/forms/new-json-schema-form/type';
import { TEXT_INPUT_TYPES, VALIDATION_MODES } from '@/inputs/forms/new-json-schema-form/type';
import { useValidation } from '@/inputs/forms/new-json-schema-form/validation';
import PTextInput from '@/inputs/input/PTextInput.vue';
import type { SupportLanguage } from '@/translations';
import { supportLanguages } from '@/translations';

export default defineComponent<JsonSchemaFormProps>({
    name: 'PJsonSchemaForm',
    components: {
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
        });
        addFormats(ajv);

        const state = reactive({
            schemaProperties: computed<InnerJsonSchema[]>(() => {
                const properties: object|undefined = props.schema?.properties;
                if (properties && !isEmpty(properties)) {
                    return Object.entries(properties).map(([k, schemaProperty]) => {
                        const refined: InnerJsonSchema = {
                            ...schemaProperty,
                            id: k,
                            inputType: getInputTypeBySchemaProperty(schemaProperty),
                            inputPlaceholder: getInputPlaceholderBySchemaProperty(schemaProperty),
                        };
                        return refined;
                    });
                }
                return [];
            }),
            requiredList: computed<string[]>(() => props.schema?.required ?? []),
            proxyFormData: initFormDataWithSchema(props.schema, props.formData) as object,
            contextKey: Math.floor(Math.random() * Date.now()),
        });

        const { localize } = useLocalize(props);
        const {
            invalidMessages, validatorErrors, inputOccurred,
            validateFormData, getPropertyInvalidState,
        } = useValidation(props, {
            ajv,
            formData: computed(() => state.proxyFormData),
            localize,
        });

        const setFormData = (formData: object = {}) => {
            const newFormData = {};
            state.schemaProperties.forEach(({ id }) => {
                newFormData[id] = formData[id];
            });
            state.proxyFormData = newFormData;
        };
        const reset = (formData?: object) => {
            setFormData(formData);
            validatorErrors.value = null;
            inputOccurred.value = {};
        };

        /* Event Handlers */
        const handleTextInput = (property: InnerJsonSchema, val?: string) => {
            const { id } = property;
            state.proxyFormData[id] = refineValueByProperty(property, val);
            const isValid = validateFormData();
            emit('update:form-data', state.proxyFormData);
            emit('validate', isValid);
            emit('change', isValid, state.proxyFormData);
            if (!inputOccurred.value[id]) inputOccurred.value[id] = true;
        };

        /* Watchers */
        watch(() => props.schema, () => {
            state.contextKey = Math.floor(Math.random() * Date.now());
            reset(props.formData ?? {});
        });
        watch(() => props.formData, (formData) => {
            if (formData === state.proxyFormData) return;
            setFormData(formData);
        });
        watch(() => state.proxyFormData, () => {
            const isValid = validateFormData();
            emit('update:form-data', state.proxyFormData);
            emit('validate', isValid);
            emit('change', isValid, state.proxyFormData);
        });

        return {
            ...toRefs(state),
            invalidMessages,
            getPropertyInvalidState,
            handleTextInput,
            TEXT_INPUT_TYPES,
        };
    },
});
</script>
