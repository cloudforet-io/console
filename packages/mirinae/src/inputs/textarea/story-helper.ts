import { faker } from '@faker-js/faker';
import type { Args, ArgTypes, Parameters } from '@storybook/vue';

export const getTextareaArgs = (): Args => ({
    value: faker.lorem.sentence(30),
    placeholder: 'placeholder',
    autofocus: false,
    readonly: false,
    invalid: false,
    disabled: false,
    'v-model': '',
});

export const getTextareaParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getTextareaArgTypes = (): ArgTypes => ({
    value: {
        name: 'value',
        description: 'The value for textarea contents.',
        table: {
            type: {
                summary: 'string, number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    placeholder: {
        name: 'placeholder',
        description: 'The placeholder for textarea contents.',
        table: {
            type: {
                summary: 'string, number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    autofocus: {
        name: 'autofocus',
        type: 'boolean',
        description: 'Whether to autofocus textarea or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    readonly: {
        name: 'readonly',
        type: 'boolean',
        description: 'Whether to make readonly or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    invalid: {
        name: 'invalid',
        type: 'boolean',
        description: 'Whether to show invalid style or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    disabled: {
        name: 'disabled',
        type: 'boolean',
        description: 'Disabled textarea.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    'v-model': {
        name: 'v-model',
        description: 'Two way binding for `value` props with `update:value` event.',
        table: {
            type: {
                summary: 'string, number',
            },
            category: 'model',
            defaultValue: {
                summary: '',
            },
        },
        control: null,
    },
    onUpdateValue: {
        name: 'update:value',
        description: 'Works with `v-model` and `value` props sync.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    onNativeEvents: {
        name: 'native events',
        description: 'All native events textarea emits.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
});
