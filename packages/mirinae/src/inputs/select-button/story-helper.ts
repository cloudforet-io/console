import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { SELECT_BUTTON_LAYOUT_TYPE, SELECT_BUTTON_SIZE, SELECT_BUTTON_STYLE_TYPE } from '@/inputs/select-button/config';

export const getSelectButtonArgs = (): Args => ({
    'v-model': [],
    value: true,
    iconName: 'ic_chart-line',
    disabled: false,
    selected: undefined,
    predicate: undefined,
    multiSelectable: false,
    layout: SELECT_BUTTON_LAYOUT_TYPE.TEXT_ONLY,
    styleType: SELECT_BUTTON_STYLE_TYPE.secondary,
    size: SELECT_BUTTON_SIZE.md,
    defaultSlot: 'click me!',
});

export const getSelectButtonParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=13512%3A300523',
    },
});

export const getSelectButtonArgTypes = (): ArgTypes => ({
    /* props */
    'v-model': {
        name: 'v-model',
        description: 'Two way binding for `selected` props with `change` event.',
        table: {
            type: {
                summary: 'any',
            },
            category: 'model',
            defaultValue: {
                summary: '[]',
            },
        },
        control: null,
    },
    value: {
        name: 'value',
        description: 'The value to be compared for the \'selected\' props.',
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: 'object',
    },
    iconName: {
        name: 'iconName',
        type: 'string',
        description: 'You can use the icon name from the [Icons](https://storybook.developer.spaceone.dev/?path=/story/foundation-graphics-icons--all-icons).',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ic_chart-line',
            },
        },
        control: 'object',
    },
    disabled: {
        name: 'disabled',
        type: 'boolean',
        description: 'Whether to disable or not.',
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
    selected: {
        name: 'selected',
        description: 'Selected value(s).',
        table: {
            type: {
                summary: 'any, any[]',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    predicate: {
        name: 'predicate',
        type: 'function',
        description: `Function that predicate two arguments are the same or not.
        It's useful when the props \`value\` is an object.`,
        table: {
            type: {
                summary: 'func',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: null,
    },
    multiSelectable: {
        name: 'multiSelectable',
        type: 'boolean',
        description: 'Whether to allow multi select or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    layout: {
        name: 'layout',
        type: 'string',
        description: `Layout of select button. ${Object.values(SELECT_BUTTON_LAYOUT_TYPE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SELECT_BUTTON_LAYOUT_TYPE.TEXT_ONLY,
            },
        },
        control: 'select',
        options: Object.values(SELECT_BUTTON_LAYOUT_TYPE),
    },
    styleType: {
        name: 'styleType',
        type: 'string',
        description: `Style type of select button. ${Object.values(SELECT_BUTTON_STYLE_TYPE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SELECT_BUTTON_STYLE_TYPE.secondary,
            },
        },
        control: 'select',
        options: Object.values(SELECT_BUTTON_STYLE_TYPE),
    },
    size: {
        name: 'size',
        type: 'string',
        description: `Size of select button. ${Object.values(SELECT_BUTTON_SIZE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SELECT_BUTTON_SIZE.md,
            },
        },
        control: 'select',
        options: Object.values(SELECT_BUTTON_SIZE),
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        description: 'Slot for the additional selectable area that explains checkbox.',
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
    /* event */
    onChange: {
        name: 'change',
        description: `Event emitted when selected state changed. 
        The first argument is the changed \`selected\` props.
        And the second argument is passed as a boolean value whether or not it is selected.`,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default
    default: { table: { disable: true } },
});
