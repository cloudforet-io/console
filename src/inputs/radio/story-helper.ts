import { argTypes as selectArgTypes } from '@/states/select-state/story-helper';
import { ArgTypes } from '@storybook/addons';

const getArgTypes = () => {
    const argTypes: ArgTypes = {
        ...selectArgTypes,
        'v-model': {
            name: 'v-model',
            type: { name: 'any' },
            description: 'Two way binding for `selected` props with `change` event.',
            defaultValue: [],
            table: {
                type: {
                    summary: 'any',
                },
                category: 'model',
                defaultValue: {
                    summary: '[]',
                },
            },
            control: null,
        },
        invalid: {
            name: 'invalid',
            type: { name: 'boolean' },
            description: 'Apply invalid style',
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
        defaultSlot: {
            name: 'default',
            description: 'Slot for the additional selectable area that explains checkbox.',
            defaultValue: 'click me!',
            table: {
                type: {
                    summary: null,
                },
                defaultValue: {
                    summary: null,
                },
                category: 'slots',
            },
            control: {
                type: 'text',
            },
        },
        radioIconSlot: {
            name: 'radio-icon',
            description: 'Slot for custom radio icon.',
            defaultValue: null,
            table: {
                type: {
                    summary: null,
                },
                defaultValue: {
                    summary: null,
                },
                category: 'slots',
            },
            control: {
                type: 'text',
            },
        },
        radioLeftSlot: {
            name: 'radio-left',
            description: 'Slot for left area of radio.',
            defaultValue: null,
            table: {
                type: {
                    summary: null,
                },
                defaultValue: {
                    summary: null,
                },
                category: 'slots',
            },
            control: {
                type: 'text',
            },
        },
    };
    delete argTypes.multiSelectable;

    argTypes.selected = {
        ...selectArgTypes.selected,
        defaultValue: undefined,
        table: {
            ...selectArgTypes.selected.table,
            defaultValue: {
                summary: 'undefined',
            },
        },
    };
    return argTypes;
};
export const argTypes = getArgTypes();
