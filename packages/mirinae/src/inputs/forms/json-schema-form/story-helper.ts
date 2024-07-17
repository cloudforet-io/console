import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getDefaultFormData, getDefaultSchema } from '@/inputs/forms/json-schema-form/mock';
import { VALIDATION_MODES } from '@/inputs/forms/json-schema-form/type';
import { supportLanguages } from '@/translations';

export const getJsonSchemaFormArgs = (): Args => ({
    schema: getDefaultSchema(),
    formData: getDefaultFormData(),
    language: supportLanguages[0],
    validationMode: VALIDATION_MODES[0],
    resetOnSchemaChange: false,
    customErrorMap: null,
    referenceHandler: undefined,
    useFixedMenuStyle: false,
    uniformWidth: false,
    labelExtraSlot: null,
    dropdownExtraSlot: null,
    inputExtraSlot: null,
    onChange: null,
    onValidate: null,
    onUpdateFormData: null,
});

export const getJsonSchemaFormParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A180989',
    },
});

export const getJsonSchemaFormArgTypes = (): ArgTypes => ({
    schema: {
        name: 'schema',
        type: { name: 'object' } as SBType,
        required: true,
        description: 'The json schema of form.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    formData: {
        name: 'formData',
        type: { name: 'object' } as SBType,
        required: true,
        description: 'Input data of form. This is `sync` prop with `update:form-data` event.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    language: {
        name: 'language',
        type: 'string',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: supportLanguages[0],
            },
        },
        control: null,
    },
    validationMode: {
        name: 'validationMode',
        type: 'string',
        description: `Validation mode. ${VALIDATION_MODES} are available. <br/>
        \`input\`:  Show validation results only for fields where input occurred.  <br/>
        \`all\`:  Show the validation results of all fields.  <br/>
        \`none\`:  Do not show validation results.  <br/>
        `,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'input',
            },
        },
        control: 'select',
        options: VALIDATION_MODES,
    },
    resetOnSchemaChange: {
        name: 'resetOnSchemaChange',
        type: 'boolean',
        description: 'Whether to reset validation state and input occurred state when schema prop is changed.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    customErrorMap: {
        name: 'customErrorMap',
        type: { name: 'object' } as SBType,
        description: 'Error map for custom error messages.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    referenceHandler: {
        name: 'referenceHandler',
        type: { name: 'function' } as SBType,
        description: 'Handler that returns auto-completion menu according to input value.',
        table: {
            type: {
                summary: 'function',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: null,
    },
    useFixedMenuStyle: {
        name: 'useFixedMenuStyle',
        type: 'boolean',
        description: 'Whether to use position fixed style on dropdown form\'s menu or not. ',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    uniformWidth: {
        name: 'uniformWidth',
        type: 'boolean',
        description: 'It ensures that all input forms have the same width, creating a consistent and visually appealing layout.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    // slots
    labelExtraSlot: {
        name: 'label-extra',
        description: 'Slot for add something into right area of label',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    dropdownExtraSlot: {
        name: 'dropdown-extra',
        description: 'Slot for add something into right area of selected item of `PSelectDropdown` or `PFilterableDropdown`.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    inputExtraSlot: {
        name: 'input-extra',
        description: 'Slot for add something into right area of input',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    // events
    onChange: {
        name: 'change',
        description: `Emitted when validation result and form data are changed. <br/>
        Event Parameters: <br/>
         - isValid: \`boolean\` <br/>
         - formData: \`object\``,
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
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
