import { argTypes as selectArgTypes } from '@/hooks/select/story-helper';
import { SELECT_BUTTON_SIZE, SELECT_BUTTON_STYLE_TYPE } from '@/inputs/select-button/config';
import { ArgTypes } from '@storybook/addons';
import { ANIMATION_TYPE } from '@/foundation/icons/config';

const getArgTypes = (): ArgTypes => {
    const argTypes: ArgTypes = {
        ...selectArgTypes,
        icon: {
            name: 'icon',
            type: { name: 'string' },
            description: 'The icon name that represent the status.',
            defaultValue: undefined,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'undefined',
                },
            },
            control: {
                type: 'text',
            },
        },
        lottie: {
            ame: 'lottie',
            type: { name: 'string' },
            description: 'The lottie name that represent the status.',
            defaultValue: undefined,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'undefined',
                },
            },
            control: {
                type: 'text',
            },
        },
        iconAnimation: {
            name: 'iconAnimation',
            type: { name: 'string' },
            description: `Icon Animation type. ${Object.values(ANIMATION_TYPE).map(d => `'${d}'`)} are available.`,
            defaultValue: undefined,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'undefined',
                },
            },
            control: {
                type: 'select',
                options: Object.values(ANIMATION_TYPE),
            },
        },
        defaultSlot: {
            name: 'default',
            description: 'Slot for text.',
            defaultValue: '',
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
        disableCheckIcon: {
            name: 'disableCheckIcon',
            type: { name: 'boolean' },
            description: 'Whether to show check icon or not.',
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
    };

    delete argTypes.disabled;

    argTypes.value.defaultValue = 'select status';
    argTypes.value.table.defaultValue.summary = '""';

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
