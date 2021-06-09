import { argTypes as selectArgTypes } from '@/hooks/select/story-helper';
import { SELECT_BUTTON_SIZE, SELECT_BUTTON_STYLE_TYPE } from '@/inputs/select-button/config';
import { ArgTypes } from '@storybook/addons';

const getArgTypes = (): ArgTypes => {
    const argTypes: ArgTypes = {
        ...selectArgTypes,
        styleType: {
            name: 'styleType',
            type: { name: 'string' },
            description: `Style type of select button. ${Object.values(SELECT_BUTTON_STYLE_TYPE)} are available.`,
            defaultValue: SELECT_BUTTON_STYLE_TYPE.secondary,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: SELECT_BUTTON_STYLE_TYPE.secondary,
                },
            },
            control: {
                type: 'select',
                options: Object.values(SELECT_BUTTON_STYLE_TYPE),
            },
        },
        size: {
            name: 'size',
            type: { name: 'string' },
            description: `Size of select button. ${Object.values(SELECT_BUTTON_SIZE)} are available.`,
            defaultValue: SELECT_BUTTON_SIZE.md,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: SELECT_BUTTON_SIZE.md,
                },
            },
            control: {
                type: 'select',
                options: Object.values(SELECT_BUTTON_SIZE),
            },
        },
        defaultSlot: {
            name: 'default',
            description: 'Slot for card contents.',
            defaultValue: 'Click Me!',
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

    delete argTypes.disabled;

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
