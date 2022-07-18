import { faker } from '@faker-js/faker';
import type { ArgTypes } from '@storybook/addons';

export const getTextareaArgTypes = (): ArgTypes => ({
    value: {
        name: 'value',
        type: { name: 'string, number' },
        description: 'The value for textarea contents.',
        defaultValue: faker.lorem.sentence(30),
        table: {
            type: {
                summary: 'string, number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    placeholder: {
        name: 'placeholder',
        type: { name: 'string, number' },
        description: 'The placeholder for textarea contents.',
        defaultValue: 'placeholder',
        table: {
            type: {
                summary: 'string, number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    autofocus: {
        name: 'autofocus',
        type: { name: 'boolean' },
        description: 'Whether to autofocus textarea or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    readonly: {
        name: 'readonly',
        type: { name: 'boolean' },
        description: 'Whether to make readonly or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Whether to show invalid style or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Disabled textarea.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    'v-model': {
        name: 'v-model',
        type: { name: 'string, number' },
        description: 'Two way binding for `value` props with `update:value` event.',
        defaultValue: '',
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
