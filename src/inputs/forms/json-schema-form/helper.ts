import { INPUT_TYPE, JsonSchema, UiSchema } from '@/inputs/forms/json-schema-form/type';


const getErrorUiSchemaByType = (key: string, value: JsonSchema, type: string): UiSchema => {
    const errorUiSchema = {
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
            class: 'error-text',
            domProps: {},
        },
    };
    let notSchema = {};
    let errorMessage = '';

    if (type === 'minLength') {
        notSchema = { minLength: value.minLength };
        errorMessage = `should NOT be shorter than ${value.minLength} characters`;
    } else if (type === 'pattern') {
        notSchema = { pattern: value.pattern };
        errorMessage = 'invalid format';
    } else if (type === 'minimum') {
        notSchema = { minimum: value.minimum };
        errorMessage = `should be >= ${value.minimum}`;
    } else if (type === 'maximum') {
        notSchema = { maximum: value.maximum };
        errorMessage = `should be <= ${value.maximum}`;
    }

    errorUiSchema.displayOptions.schema.not = notSchema;
    errorUiSchema.fieldOptions.domProps = {
        innerHTML: errorMessage,
    };
    return errorUiSchema;
};
const getErrorContainerUiSchema = (key: string, value: JsonSchema): UiSchema => {
    const errorContainerUiSchema = {
        component: 'div',
        children: [] as UiSchema[],
    };

    if (value.type === 'string') {
        if (value.minLength) {
            const errorUiSchema = getErrorUiSchemaByType(key, value, 'minLength');
            errorContainerUiSchema.children.push(errorUiSchema);
        }
        if (value.pattern) {
            const errorUiSchema = getErrorUiSchemaByType(key, value, 'pattern');
            errorContainerUiSchema.children.push(errorUiSchema);
        }
    } else if (value.type === 'number' || value.type === 'integer') {
        if (value.minimum !== undefined) {
            const errorUiSchema = getErrorUiSchemaByType(key, value, 'minimum');
            errorContainerUiSchema.children.push(errorUiSchema);
        }
        if (value.maximum !== undefined) {
            const errorUiSchema = getErrorUiSchemaByType(key, value, 'maximum');
            errorContainerUiSchema.children.push(errorUiSchema);
        }
    }
    return errorContainerUiSchema;
};

const getInputUiSchema = (key: string, value: JsonSchema, required = true): UiSchema => ({
    component: 'p-field-group',
    fieldOptions: {
        props: {
            label: value.title,
            required,
        },
    },
    children: [
        {
            component: 'p-text-input',
            model: key,
            errorOptions: {
                class: ['invalid'],
            },
            fieldOptions: {
                props: {
                    type: INPUT_TYPE[value.type],
                },
                attrs: {
                    type: INPUT_TYPE[value.type],
                    placeholder: value.examples ? value.examples[0] : '',
                },
                on: ['input'],
            },
        },
    ],
});

export const getFormUiSchema = (schema: JsonSchema): Record<string, UiSchema>[] => {
    const properties = schema.properties || {};
    const formUiSchema: Record<string, UiSchema>[] = [];

    Object.entries(properties).forEach(([key, value]) => {
        const child: Record<string, UiSchema> = {};
        const isRequired = !!(schema.required?.includes(key));

        /* 1. set input UI schema */
        child.input = getInputUiSchema(key, value, isRequired); // TODO: need to add select, radio, etc

        /* 2. set error UI schema */
        if (isRequired) {
            child.error = getErrorContainerUiSchema(key, value);
        }

        formUiSchema.push(child);
    });

    return formUiSchema;
};

export const getDefaultInputValue = (schema: JsonSchema) => {
    const properties = schema.properties || {};
    const defaultModel = {};

    Object.entries(properties).forEach(([key, value]) => {
        if (value.default) {
            defaultModel[key] = value.default;
        }
    });

    return defaultModel;
};
