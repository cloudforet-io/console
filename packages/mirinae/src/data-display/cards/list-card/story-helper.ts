import { getCardArgTypes } from '@/data-display/cards/card/story-helper';
import { getDataLoaderArgTypes } from '@/feedbacks/loading/data-loader/story-helper';

export const getListCardArgTypes = () => {
    const dataLoaderArgTypes = getDataLoaderArgTypes();
    const argTypes = {
        ...getCardArgTypes(),
        items: {
            name: 'items',
            type: 'array',
            description: 'List items',
            table: {
                type: {
                    summary: 'array',
                },
                category: 'props',
                defaultValue: {
                    summary: '[]',
                },
            },
            control: 'object',
        },
        loading: {
            name: 'loading',
            type: 'boolean',
            description: 'Whether to show loader or not.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        hoverable: {
            name: 'hoverable',
            type: 'boolean',
            description: 'Whether to show hover style or not.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        itemSlot: {
            name: 'item',
            description: 'Slot for list item.',
            table: {
                type: {
                    summary: null,
                },
                defaultValue: {
                    summary: null,
                },
                category: 'slots',
            },
            control: 'text',
        },
        disableEmptyCase: dataLoaderArgTypes.disableEmptyCase,
        loaderSlot: dataLoaderArgTypes.loaderSlot,
        noDataSlot: dataLoaderArgTypes.noDataSlot,
    };

    // argTypes.disableEmptyCase = dataLoaderArgTypes.disableEmptyCase;
    // argTypes.loaderSlot = dataLoaderArgTypes.loaderSlot;
    // argTypes.noDataSlot = dataLoaderArgTypes.noDataSlot;

    // delete argTypes.defaultSlot;

    return argTypes;
};
