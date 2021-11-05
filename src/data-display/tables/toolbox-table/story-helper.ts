import { ArgTypes } from '@storybook/addons';
import { getToolboxArgTypes } from '@/navigation/toolbox/story-helper';
import { getDataTableArgsType } from '@/data-display/tables/data-table/story-helper';

export const getToolboxTableArgTypes = (): ArgTypes => {
    const argTypes: ArgTypes = {
        ...getDataTableArgsType(),
        ...getToolboxArgTypes(),
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
