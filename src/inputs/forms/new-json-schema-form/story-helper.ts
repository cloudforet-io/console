import type { ArgTypes } from '@storybook/addons';

import { getDefaultFormData, getDefaultSchema } from '@/inputs/forms/new-json-schema-form/mock';

export const getJsonSchemaFormArgTypes = (): ArgTypes => ({
    schema: {
        name: 'schema',
        type: { name: 'object', required: true },
        description: 'The json schema of form.',
        defaultValue: getDefaultSchema(),
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: {
            type: 'object',
        },
    },
    formData: {
        name: 'formData',
        type: { name: 'object', required: true },
        description: 'Input data of form. This is `sync` prop with `update:form-data` event.',
        defaultValue: getDefaultFormData(),
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: {
            type: 'object',
        },
    },
    // events
    onChange: {
        name: 'change',
        description: `Emitted when validation result and form data are changed. <br/>
        Event Parameters: <br/>
         - isValid: \`boolean\` <br/>
         - formData: \`object\``,
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onValidate: {
        name: 'validate',
        description: `Emitted after validation occurred. <br/>
        Event Parameters: <br/>
         - isValid: \`boolean\``,
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onUpdateFormData: {
        name: 'update:form-data',
        description: `Emitted when form data is updated. <br/>
        Event Parameters: <br/>
         - formData: \`object\``,
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
