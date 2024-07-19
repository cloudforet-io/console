import type { ArgTypes, Args, Parameters } from '@storybook/vue';
import icon from 'vue-svgicon';

export const getLabelArgs = (): Args => ({
    leftIcon: '',
    text: 'Label',
    deletable: false,
    clickable: false,
    itemClick: null,
    delete: null,
    labelContentSlot: 'Label Content',
});

export const getLabelParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'figma url',
    },
});

export const getLabelArgTypes = (): ArgTypes => ({
    leftIcon: {
        name: 'leftIcon',
        type: { name: 'string' },
        description: 'Left icon name',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'select',
        options: Object.keys(icon.icons),
    },
    // backgroundColor: {
    //     name: 'backgroundColor',
    //     type: { name: 'string' },
    //     description: 'Background color of label.',
    //     defaultValue: '',
    //     table: {
    //         type: {
    //             summary: 'string',
    //         },
    //         category: 'props',
    //         defaultValue: {
    //             summary: undefined,
    //         },
    //     },
    // },
    text: {
        name: 'text',
        type: { name: 'string' },
        description: "The text for label's content",
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
    },
    deletable: {
        name: 'deletable',
        type: { name: 'boolean' },
        description: 'Indicates whether the label can be deleted or not. If true, the delete icon button is displayed.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
    },
    clickable: {
        name: 'clickable',
        type: { name: 'boolean' },
        description: 'Indicates whether the label can be clicked or not. If true, shows the UI of the clicked label.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
    },
    // active: {
    //     name: 'active',
    //     type: { name: 'boolean' },
    //     description: 'The active status of label. This is the state when it is clicked in the clickable state.',
    //     defaultValue: false,
    //     table: {
    //         type: {
    //             summary: 'boolean',
    //         },
    //         category: 'props',
    //         defaultValue: {
    //             summary: 'false',
    //         },
    //     },
    // },
    // events
    itemClick: {
        name: 'item-click',
        description: 'This event is emitted when label is clicked.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    delete: {
        name: 'delete',
        description: 'This event is emitted when label delete icon button is Clicked.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    // slots
    labelContentSlot: {
        name: 'labelContentSlot',
        description: 'Slot for label content. This slot replace text props and leftIcon props.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Label Content',
        },
    },
    // default
    clickStop: { table: { disable: true } },
    active: { table: { disable: true } },
    'label-content': { table: { disable: true } },
});
