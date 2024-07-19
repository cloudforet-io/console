import { faker } from '@faker-js/faker';
import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';
import { range } from 'lodash';

import { CARD_STYLE_TYPE, CARD_SIZE } from '@/data-display/cards/card/config';
import { getCardArgTypes } from '@/data-display/cards/card/story-helper';
import { getDataLoaderArgTypes } from '@/feedbacks/loading/data-loader/story-helper';


export const getListCardArgs = (): Args => ({
    header: 'This is header!',
    styleType: CARD_STYLE_TYPE.gray100,
    size: CARD_SIZE.md,
    defaultSlot: 'This is card body!',
    headerSlot: '',
    disableEmptyCase: false,
    items: range(10).map(() => faker.lorem.sentence(8)),
    loading: false,
    hoverable: false,
    itemSlot: null,
});

export const getListCardParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getListCardArgTypes = (): ArgTypes => {
    const dataLoaderArgTypes = getDataLoaderArgTypes();
    const argTypes: ArgTypes = {
        ...getCardArgTypes(),
        items: {
            name: 'items',
            type: { name: 'array' } as SBType,
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
            type: { name: 'boolean' },
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
            type: { name: 'boolean' },
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

        // default
        loader: { table: { disable: true } },
        'no-data': { table: { disable: true } },
        item: { table: { disable: true } },
        defaultSlot: { table: { disable: true } },
    };

    // argTypes.disableEmptyCase = dataLoaderArgTypes.disableEmptyCase;
    // argTypes.loaderSlot = dataLoaderArgTypes.loaderSlot;
    // argTypes.noDataSlot = dataLoaderArgTypes.noDataSlot;

    // delete argTypes.defaultSlot;

    return argTypes;
};
