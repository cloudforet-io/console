<template>
    <div>
        <p-field-group v-for="schemaProperty in schemaProperties"
                       :key="`field-${contextKey}-${schemaProperty.id}`"
                       class="input-form-wrapper"
                       :label="schemaProperty.title"
                       :required="requiredList.includes(schemaProperty.id)"
                       :invalid="getPropertyInvalidState(schemaProperty)"
                       :invalid-text="invalidMessages[schemaProperty.id]"
        >
            <template #default="{invalid}">
                <p-text-input v-if="TEXT_INPUT_TYPES.includes(schemaProperty.type)"
                              :key="`field-${contextKey}-${schemaProperty.id}`"
                              :value="proxyFormData[schemaProperty.id]"
                              :type="getInputTypeBySchemaProperty(schemaProperty)"
                              :invalid="invalid"
                              :placeholder="getInputPlaceholderBySchemaProperty(schemaProperty)"
                              @input="handleTextInput(schemaProperty, ...arguments)"
                />
            </template>
        </p-field-group>
    </div>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';

import { isEmpty } from 'lodash';

import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import {
    initFormDataWithSchema,
    NUMERIC_TYPES,
    refineValueByProperty,
} from '@/inputs/forms/new-json-schema-form/helper';
import { useLocalize } from '@/inputs/forms/new-json-schema-form/localize';
import type {
    InnerJsonSchema,
    JsonSchema,
    JsonSchemaFormProps,
} from '@/inputs/forms/new-json-schema-form/type';
import { TEXT_INPUT_TYPES } from '@/inputs/forms/new-json-schema-form/type';
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
    },
    setup(props, { emit }) {
        const state = reactive({
            schemaProperties: computed<InnerJsonSchema[]>(() => {
                const properties = props.schema?.properties;
                if (properties && !isEmpty(properties)) {
                    return Object.entries(properties).map(([k, v]) => ({
                        ...v,
                        id: k,
                    }));
                }
                return [];
            }),
            requiredList: computed<string[]>(() => props.schema?.required ?? []),
            proxyFormData: initFormDataWithSchema(props.schema, props.formData) as object,
            contextKey: Math.floor(Math.random() * Date.now()),
        });

        const { localize } = useLocalize(props);
        const {
            invalidMessages, inputOccurred,
            validateFormData, getPropertyInvalidState,
        } = useValidation(props, {
            localize, formData: computed(() => state.proxyFormData),
        });

        const getInputTypeBySchemaProperty = (schemaProperty: InnerJsonSchema) => {
            if (schemaProperty.type === 'string') return 'text';
            if (NUMERIC_TYPES.includes(schemaProperty.type)) return 'number';
            return 'text';
        };
        const getInputPlaceholderBySchemaProperty = (schemaProperty: InnerJsonSchema) => schemaProperty.examples?.[0] ?? '';
        const setFormData = (formData: object = {}) => {
            const newFormData = {};
            state.schemaProperties.forEach(({ id }) => {
                newFormData[id] = formData[id];
            });
            state.proxyFormData = newFormData;
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
            getInputTypeBySchemaProperty,
            getInputPlaceholderBySchemaProperty,
            getPropertyInvalidState,
            handleTextInput,
            TEXT_INPUT_TYPES,
        };
    },
});
</script>
