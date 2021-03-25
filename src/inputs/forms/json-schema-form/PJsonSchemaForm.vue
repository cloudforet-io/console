<template>
    <vue-form-json-schema
        v-model="proxyModel"
        class="p-json-schema-form"
        :schema="schema"
        :ui-schema="uiSchema"
        :options="options"
        @validated="onValidated"
        @state-change="onChangeState"
    />
</template>

<script lang="ts">
import {
    cloneDeep, sortBy, flatMap, chain,
} from 'lodash';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import VueFormJsonSchema from 'vue-form-json-schema/dist/vue-form-json-schema.esm';
import {
    JsonSchema, JsonSchemaFormProps, UiSchema, InputType,
} from '@/inputs/forms/json-schema-form/type';

import { makeProxy } from '@/util/composition-helpers';

export default {
    name: 'PJsonSchemaForm',
    components: {
        VueFormJsonSchema,
    },
    props: {
        model: {
            type: Object,
            required: true,
        },
        schema: {
            type: Object,
            required: true,
        },
        isValid: {
            type: Boolean,
            default: false,
        },
        showValidationErrors: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: JsonSchemaFormProps, { emit }) {
        const state = reactive({
            proxyModel: makeProxy('model', props, emit),
            uiSchema: [] as UiSchema[],
            options: computed(() => ({
                castToSchemaType: true,
                showValidationErrors: props.showValidationErrors,
            })),
            vueFormJsonSchemaState: {}, // contains information such as validation errors
        });

        const getErrorUiSchema = (key, value) => {
            const errorContainerUiSchema = {
                component: 'div',
                fieldOptions: {
                    class: ['error-text-wrapper'],
                },
                children: [] as UiSchema[],
            };
            const defaultErrorUiSchema = {
                component: 'div',
                model: key,
                errorHandler: true,
                displayOptions: {
                    model: key,
                    schema: {
                        not: {},
                    },
                },
                fieldOptions: {
                    class: ['error-text'],
                    domProps: {},
                },
            };

            if (value.type === 'string') {
                if (value.minLength) {
                    const newErrorUiSchema = cloneDeep(defaultErrorUiSchema);
                    newErrorUiSchema.displayOptions.schema.not = {
                        minLength: value.minLength,
                    };
                    newErrorUiSchema.fieldOptions.domProps = {
                        innerHTML: `should NOT be shorter than ${value.minLength} characters`,
                    };
                    errorContainerUiSchema.children.push(newErrorUiSchema);
                }
            } else if (value.type === 'number' || value.type === 'integer') {
                if (value.minimum !== undefined) {
                    const newErrorUiSchema = cloneDeep(defaultErrorUiSchema);
                    newErrorUiSchema.displayOptions.schema.not = {
                        minimum: value.minimum,
                    };
                    newErrorUiSchema.fieldOptions.domProps = {
                        innerHTML: `should be >= ${value.minimum}`,
                    };
                    errorContainerUiSchema.children.push(newErrorUiSchema);
                } if (value.maximum !== undefined) {
                    const newErrorUiSchema = cloneDeep(defaultErrorUiSchema);
                    newErrorUiSchema.displayOptions.schema.not = {
                        maximum: value.maximum,
                    };
                    newErrorUiSchema.fieldOptions.domProps = {
                        innerHTML: `should be <= ${value.maximum}`,
                    };
                    errorContainerUiSchema.children.push(newErrorUiSchema);
                }
            }
            return errorContainerUiSchema;
        };
        const generateUiSchema = (schema: JsonSchema) => {
            const properties = schema.properties;
            const required = schema.required;
            const formUiSchema: Record<string, UiSchema>[] = [];
            const defaultModel = {};

            if (properties) {
                Object.entries(properties).forEach(([key, value]) => {
                    if (value.default) {
                        defaultModel[key] = value.default;
                    }
                    const children: Record<string, UiSchema> = {};
                    const labelUiSchema = {
                        component: 'label',
                        fieldOptions: {
                            attrs: { for: key },
                            class: ['form-label'],
                            domProps: {
                                innerHTML: value.title,
                            },
                        },
                    };
                    // const requiredMarkUiSchema = {
                    //     component: 'span',
                    //     fieldOptions: {
                    //         class: ['required-mark'],
                    //         domProps: {
                    //             innerHTML: '*',
                    //         },
                    //     },
                    // };
                    const optionalMarkUiSchema = {
                        component: 'span',
                        fieldOptions: {
                            class: ['optional-mark'],
                            domProps: {
                                innerHTML: '(optional)',
                            },
                        },
                    };
                    // TODO: need to add select, radio, etc
                    const inputUiSchema = {
                        component: 'input',
                        model: key,
                        errorOptions: {
                            class: ['invalid'],
                        },
                        fieldOptions: {
                            attrs: {
                                id: key,
                                type: InputType[value.type],
                                placeholder: value.examples ? value.examples[0] : '',
                            },
                            class: ['form-control'],
                            on: ['input'],
                        },
                    };

                    children.label = labelUiSchema;
                    // if (required?.includes(key)) children.required = requiredMarkUiSchema;
                    if (!required?.includes(key)) children.optional = optionalMarkUiSchema;
                    children.input = inputUiSchema;
                    // TODO: need to add number, select, etc
                    if (required?.includes(key)) {
                        const errorUiSchema = getErrorUiSchema(key, value);
                        children.error = errorUiSchema;
                    }

                    formUiSchema.push(children);
                });
                emit('update:model', defaultModel);
            }

            state.uiSchema = sortBy(formUiSchema, (d: any) => d.label?.fieldOptions?.attrs?.for)
                .map(d => ({
                    component: 'div',
                    fieldOptions: {
                        class: [
                            'form-group',
                        ],
                    },
                    children: flatMap(d) as UiSchema[],
                }));
        };

        const onChangeState = (value) => {
            state.vueFormJsonSchemaState = value;
        };
        const onValidated = (isValid) => {
            emit('update:isValid', isValid);
        };

        watch(() => props.schema, async (after) => {
            if (after && after.properties) {
                generateUiSchema(after);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            onValidated,
            onChangeState,
        };
    },
};
</script>

<style lang="postcss">
.p-json-schema-form {
    .form-group {
        .form-label {
            @apply text-gray-900;
            display: inline-block;
            font-size: 0.875rem;
            font-weight: bold;
            letter-spacing: 0;
            margin-bottom: 0.25rem;
            //margin-right: 0.375rem;
        }
        .required-mark {
            @apply text-alert;
            font-size: 0.25rem;
            line-height: 1.2rem;
            margin-left: 0.1rem;
        }
        .optional-mark {
            @apply text-gray-500;
            font-size: 0.75rem;
            line-height: 1.4;
            margin-left: 0.25rem;
            margin-bottom: 0.25rem;
        }
        .form-control {
            @apply text-gray-900 border border-gray-300;
            display: block;
            width: 100%;
            max-width: 25rem;
            font-size: 0.875rem;
            line-height: 1.3rem;
            border-radius: 0.125rem;
            box-shadow: none;
            padding: 0.375rem 0.5rem;

            @screen lg {
                max-width: 50%;
            }
            &.invalid {
                @apply border border-red-500;
            }
            &::placeholder {
                @apply text-gray-300;
            }
        }
        .error-text {
            @apply text-red-500;
            font-size: 0.75rem;
            line-height: 0.875rem;
            font-weight: 400;
            background-image: none;
            padding-left: 0;
            margin-top: 0.25rem;
        }
    }
}
</style>
