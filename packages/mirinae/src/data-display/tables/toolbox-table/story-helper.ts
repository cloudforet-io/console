import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { getDataTableArgsType, getDataTableArgs } from '@/data-display/tables/data-table/story-helper';
import { getToolboxArgTypes, getToolboxArgs } from '@/navigation/toolbox/story-helper';

export const getToolboxTableArgs = (): Args => {
    const args: Args = {
        ...getDataTableArgs(),
        ...getToolboxArgs(),
        toolboxTopSlot: undefined,
        toolboxBottomSlot: undefined,
        toolboxLeftSlot: undefined,
        toolboxTableBottomSlot: undefined,
    };

    delete args.leftAreaSlot;

    return args;
};

export const getToolboxTableParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getToolboxTableArgTypes = (): ArgTypes => {
    const argTypes: ArgTypes = {
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
        // default
        'toolbox-top': { table: { disable: true } },
        'pagination-area': { table: { disable: true } },
        'toolbox-left': { table: { disable: true } },
        'toolbox-bottom': { table: { disable: true } },
        slot: { table: { disable: true } },
        'toolbox-table-bottom': { table: { disable: true } },
        export: { table: { disable: true } },
        refresh: { table: { disable: true } },
        'click-settings': { table: { disable: true } },
    };

    delete argTypes.leftAreaSlot;

    return argTypes;
};
