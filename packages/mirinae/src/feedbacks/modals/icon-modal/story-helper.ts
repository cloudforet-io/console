import type { ArgTypes } from '@storybook/addons';

import { SizeMapping } from '@/feedbacks/modals/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const getIconModalArgTypes = (): ArgTypes => ({
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Modal size. ${Object.keys(SizeMapping).map((d) => `\`${d}\``).join(', ')} are available.`,
        defaultValue: 'sm',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'sm',
            },
        },
        control: {
            type: 'select',
            options: Object.keys(SizeMapping),
        },
    },
    visible: {
        name: 'visible',
        type: { name: 'boolean', required: true },
        description: 'Whether to show modal or not. sync prop.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    iconName: {
        name: 'iconName',
        type: { name: 'string' },
        description: 'Icon name.',
        defaultValue: 'ic_service_dashboard',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    iconColor: {
        name: 'iconColor',
        type: { name: 'string' },
        description: 'Values can be given in the order of stroke and fill. Consider space as a delimiter. Giving one thing applies to both. e.g. "inherit transparent"',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'text',
        },
    },
    emoji: {
        name: 'emoji',
        type: { name: 'string' },
        description: 'Emoji.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    headerTitle: {
        name: 'headerTitle',
        type: { name: 'string' },
        description: 'Header Title',
        defaultValue: 'Header Title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'Header Title',
            },
        },
        control: {
            type: 'text',
        },
    },
    headerDesc: {
        name: 'headerDesc',
        type: { name: 'string' },
        description: 'Header description.',
        defaultValue: 'Header Description',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    buttonText: {
        name: 'buttonText',
        type: { name: 'string' },
        description: 'Button Text.',
        defaultValue: 'close',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'close',
            },
        },
        control: {
            type: 'text',
        },
    },
    buttonStyleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Button style of modal button.',
        defaultValue: BUTTON_STYLE.primary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BUTTON_STYLE.primary,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BUTTON_STYLE),
        },
    },
    backdrop: {
        name: 'backdrop',
        type: { name: 'boolean' },
        description: 'Whether to show backdrop or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    disableButton: {
        name: 'disableButton',
        type: { name: 'boolean' },
        description: 'Whether to use default button or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    // slots
    customHeader: {
        name: 'customHeader',
        description: 'Slot for custom header content',
        defaultValue: 'Title',
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
        defaultValue: 'Modal Content',
        table: {
            type: {
                summary: 'Modal Content',
            },
            category: 'slots',
            defaultValue: 'Modal Content',
        },
    },
});
