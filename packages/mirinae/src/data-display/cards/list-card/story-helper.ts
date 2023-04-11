import { faker } from '@faker-js/faker';
import type { ArgTypes } from '@storybook/addons';
import { range } from 'lodash';

import { getCardArgTypes } from '@/data-display/cards/card/story-helper';
import { getDataLoaderArgTypes } from '@/feedbacks/loading/data-loader/story-helper';

export const getListCardArgTypes = () => {
    const dataLoaderArgTypes = getDataLoaderArgTypes();
    const argTypes: ArgTypes = {
        ...getCardArgTypes(),
        items: {
            name: 'items',
            type: { name: 'array' },
            description: 'List items',
            defaultValue: range(10).map(() => faker.lorem.sentence(8)),
            table: {
                type: {
                    summary: 'array',
                },
                category: 'props',
                defaultValue: {
                    summary: '[]',
                },
            },
            control: {
                type: 'object',
            },
        },
        loading: {
            name: 'loading',
            type: { name: 'boolean' },
            description: 'Whether to show loader or not.',
            defaultValue: false,
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: {
                type: 'boolean',
            },
        },
        hoverable: {
            name: 'hoverable',
            type: { name: 'boolean' },
            description: 'Whether to show hover style or not.',
            defaultValue: false,
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: {
                type: 'boolean',
            },
        },
        itemSlot: {
            name: 'item',
            description: 'Slot for list item.',
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

    argTypes.disableEmptyCase = dataLoaderArgTypes.disableEmptyCase;
    argTypes.loaderSlot = dataLoaderArgTypes.loaderSlot;
    argTypes.noDataSlot = dataLoaderArgTypes.noDataSlot;

    delete argTypes.defaultSlot;

    return argTypes;
};
