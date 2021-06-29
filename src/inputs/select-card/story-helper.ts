import { argTypes as selectArgTypes } from '@/hooks/select/story-helper';
import { ArgTypes } from '@storybook/addons';

export const getSelectCardArgTypes = () => {
    const argTypes: ArgTypes = {
        ...selectArgTypes,
        block: {
            name: 'block',
            type: { name: 'boolean' },
            description: 'Make card style to be display block and apply wide style.',
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
        label: {
            name: 'label',
            type: { name: 'string' },
            description: 'Card label',
            defaultValue: 'Click Me!',
            table: {
                type: {
                    summary: 'string',
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
        imageUrl: {
            name: 'imageUrl',
            type: { name: 'string' },
            description: 'Card image url. It has a higher render priority than icon props.',
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
        icon: {
            name: 'icon',
            type: { name: 'string, boolean' },
            description: `Card icon.
        It has a lower priority than \`imageUrl\` props.
        So it is rendered only when there is no value in \`imageUrl\` props or when the image load fails.
        If it is \`true\`, default icon will be rendered.`,
            defaultValue: 'ic_service_compute-engine',
            table: {
                type: {
                    summary: 'string, boolean',
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
        iconColor: {
            name: 'iconColor',
            type: { name: 'string' },
            description: 'Card icon\'s color.',
            defaultValue: '',
            table: {
                type: {
                    summary: 'string',
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
        defaultSlot: {
            name: 'default',
            description: 'Slot for card contents.',
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
    };

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
