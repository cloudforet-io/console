import { getDataTableArgsType, getDataTableDefaultArgs } from '@/data-display/tables/data-table/story-helper';
import { getToolboxArgTypes, getToolboxArgs } from '@/navigation/toolbox/story-helper';

export const getToolboxTableDefaultArgs = () => {
    const args = {
        ...getDataTableDefaultArgs(),
        ...getToolboxArgs(),
        toolboxTopSlot: undefined,
        toolboxBottomSlot: undefined,
        toolboxLeftSlot: undefined,
        toolboxTableBottomSlot: undefined,
    };

    delete args.leftAreaSlot;

    return args;
};

export const getToolboxTableArgTypes = () => {
    const argTypes = {
        ...getDataTableArgsType(),
        ...getToolboxArgTypes(),
        /* slots */
        toolboxTopSlot: {
            name: 'toolbox-top',
            description: 'Slot for top area of toolbox.',
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
                defaultValue: {
                    summary: null,
                },
            },
            control: 'text',
        },
        toolboxBottomSlot: {
            name: 'toolbox-bottom',
            description: 'Slot for bottom area of toolbox.',
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
                defaultValue: {
                    summary: null,
                },
            },
            control: 'text',
        },
        toolboxLeftSlot: {
            name: 'toolbox-left',
            description: 'Slot for left area of toolbox.',
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
                defaultValue: {
                    summary: null,
                },
            },
            control: 'text',
        },
        toolboxTableBottomSlot: {
            name: 'toolbox-table-bottom',
            description: 'Slot for bottom area of toolbox table.',
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
            control: 'text',
        },
    };

    delete argTypes.leftAreaSlot;

    return argTypes;
};
