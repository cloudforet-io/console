import { ArgTypes } from '@storybook/addons';
import faker from 'faker';
import { range } from 'lodash';
import { argTypes as cardArgTypes } from '@/data-display/cards/card/story-helper';

const getArgTypes = () => {
    const argTypes: ArgTypes = {
        ...cardArgTypes,
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
            name: 'itemSlot',
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

    delete argTypes.defaultSLot;

    return argTypes;
};

export const argTypes: ArgTypes = getArgTypes();
