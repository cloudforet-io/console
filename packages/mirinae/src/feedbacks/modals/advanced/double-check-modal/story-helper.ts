import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { getButtonModalArgs, getButtonModalArgTypes } from '@/feedbacks/modals/button-modal/story-helper';
import { SizeMapping } from '@/feedbacks/modals/type';

export const getDoubleCheckModalArgs = (): Args => {
    const { loading } = getButtonModalArgs();

    return {
        modalSize: 'md',
        visible: false,
        headerTitle: 'This is header title.',
        verificationText: 'verification',
        loading,
        middleContentsSlot: null,
        bottomContentsSlot: null,
        onConfirm: null,
        onCancel: null,
    };
};

export const getDoubleCheckModalParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/t0napBIB14ZZN9RIq9uo3O/Asset-Inventory?node-id=2613%3A371966&t=0A8wuvLdPqlyb3TM-4',
    },
});

export const getDoubleCheckModalArgTypes = (): ArgTypes => {
    const buttonModalArgTypes = getButtonModalArgTypes();

    return {
        modalSize: {
            name: 'modalSize',
            type: { name: 'string' },
            description: 'Size of modal.',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: '"md"',
                },
            },
            control: 'select',
            options: Object.keys(SizeMapping),
        },
        visible: {
            name: 'visible',
            type: { name: 'boolean' },
            description: 'Whether to show modal or not.',
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
        headerTitle: {
            name: 'headerTitle',
            type: { name: 'string' },
            description: 'Header title of modal.',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: '"undefined"',
                },
            },
            control: 'text',
        },
        verificationText: {
            name: 'verificationText',
            type: { name: 'string' },
            description: 'Verification text.',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: '"null"',
                },
            },
            control: 'text',
        },
        loading: buttonModalArgTypes.loading,

        // slots
        middleContentsSlot: {
            name: 'middle-contents',
            description: 'Slots located above the Verification area.',
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
            },
        },
        bottomContentsSlot: {
            name: 'middle-contents',
            description: 'Slots located under the Verification area.',
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
            },
        },


        // events
        onConfirm: {
            name: 'confirm',
            description: 'Emitted when confirm button is clicked.',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
        onCancel: {
            name: 'cancel',
            description: 'Emitted when click cancel button or close button',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },

        // default
        'middle-contents': { table: { disable: true } },
        'bottom-contents': { table: { disable: true } },
    };
};
