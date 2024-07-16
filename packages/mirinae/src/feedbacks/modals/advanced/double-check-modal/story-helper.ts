import { getButtonModalDefaultArgs, getButtonModalArgTypes } from '@/feedbacks/modals/button-modal/story-helper';
import { SizeMapping } from '@/feedbacks/modals/type';

export const getDoubleCheckModalDefaultArgs = () => {
    const { loading } = getButtonModalDefaultArgs();

    return {
        modalSize: 'md',
        visible: false,
        headerTitle: 'This is header title.',
        verificationText: 'verification',
        loading,
        middleContentsSlot: undefined,
        bottomContentsSlot: undefined,
        onConfirm: undefined,
        onCancel: undefined,
    };
};

export const getDoubleCheckModalArgTypes = () => {
    const buttonModalArgTypes = getButtonModalArgTypes();

    return {
        modalSize: {
            name: 'modalSize',
            type: 'string',
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
            type: 'boolean',
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
            type: 'string',
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
            type: 'string',
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
    };
};
