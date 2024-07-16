import { SizeMapping } from '@/feedbacks/modals/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const getIconModalDefaultArgs = () => ({
    size: 'sm',
    visible: false,
    iconName: 'ic_service_dashboard',
    iconColor: undefined,
    emoji: '',
    headerTitle: 'Header Title',
    headerDesc: 'Header Description',
    buttonText: 'close',
    buttonStyleType: BUTTON_STYLE.primary,
    backdrop: true,
    hideButton: false,
    customHeader: 'Title',
    body: 'Modal Content',
});

export const getIconModalArgTypes = () => ({
    size: {
        name: 'size',
        type: 'string',
        description: `Modal size. ${Object.keys(SizeMapping).map((d) => `\`${d}\``).join(', ')} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'sm',
            },
        },
        control: 'select',
        options: Object.keys(SizeMapping),
    },
    visible: {
        name: 'visible',
        type: 'boolean',
        required: true,
        description: 'Whether to show modal or not. sync prop.',
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
    iconName: {
        name: 'iconName',
        type: 'string',
        description: 'Icon name.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    iconColor: {
        name: 'iconColor',
        type: 'string',
        description: 'Values can be given in the order of stroke and fill. Consider space as a delimiter. Giving one thing applies to both. e.g. "inherit transparent"',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    emoji: {
        name: 'emoji',
        type: 'string',
        description: 'Emoji.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    headerTitle: {
        name: 'headerTitle',
        type: 'string',
        description: 'Header Title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'Header Title',
            },
        },
        control: 'text',
    },
    headerDesc: {
        name: 'headerDesc',
        type: 'string',
        description: 'Header description.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    buttonText: {
        name: 'buttonText',
        type: 'string',
        description: 'Button Text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'close',
            },
        },
        control: 'text',
    },
    buttonStyleType: {
        name: 'styleType',
        type: 'string',
        description: 'Button style of modal button.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BUTTON_STYLE.primary,
            },
        },
        control: 'select',
        options: Object.values(BUTTON_STYLE),
    },
    backdrop: {
        name: 'backdrop',
        type: 'boolean',
        description: 'Whether to show backdrop or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    hideButton: {
        name: 'hideButton',
        type: 'boolean',
        description: 'Whether to use default button or not.',
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
    // slots
    customHeader: {
        name: 'customHeader',
        description: 'Slot for custom header content',
        table: {
            type: {
                summary: 'Title',
            },
            category: 'slots',
            defaultValue: 'Title',
        },
    },
    body: {
        name: 'body',
        description: 'Slot for body content',
        table: {
            type: {
                summary: 'Modal Content',
            },
            category: 'slots',
            defaultValue: 'Modal Content',
        },
    },
});
