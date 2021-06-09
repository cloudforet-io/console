import { ArgTypes } from '@storybook/addons';
import { TOOLBOX_TABLE_STYLE_TYPE } from '@/data-display/tables/toolbox-table/config';
import { getToolboxArgTypes } from '@/navigation/toolbox/story-helper';
import { getDataTableArgsType } from '@/data-display/tables/data-table/story-helper';

export const getToolboxTableArgTypes = (): ArgTypes => {
    const argTypes: ArgTypes = {
        ...getDataTableArgsType(),
        ...getToolboxArgTypes(),
        styleType: {
            name: 'styleType',
            type: { name: 'string' },
            description: `Style types. ${Object.values(TOOLBOX_TABLE_STYLE_TYPE)} are available.`,
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
                options: [undefined, ...Object.values(TOOLBOX_TABLE_STYLE_TYPE)],
            },
        },
        /* slots */
        toolboxTopSlot: {
            name: 'toolbox-top',
            description: 'Slot for top area of toolbox.',
            defaultValue: null,
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
                defaultValue: {
                    summary: null,
                },
            },
            control: {
                type: 'text',
            },
        },
        toolboxBottomSlot: {
            name: 'toolbox-bottom',
            description: 'Slot for bottom area of toolbox.',
            defaultValue: null,
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
                defaultValue: {
                    summary: null,
                },
            },
            control: {
                type: 'text',
            },
        },
        toolboxLeftSlot: {
            name: 'toolbox-left',
            description: 'Slot for left area of toolbox.',
            defaultValue: null,
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
                defaultValue: {
                    summary: null,
                },
            },
            control: {
                type: 'text',
            },
        },
    };

    delete argTypes.leftAreaSlot;

    return argTypes;
};
