import type { ArgTypes } from '@storybook/addons';
import icon from 'vue-svgicon';

import { ANIMATION_TYPE } from '@/foundation/icons/config';

export const getAllAvailableIcons = () => Object.keys(icon.icons);

export const getIconsArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'The name of icon.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    dir: {
        name: 'dir',
        type: { name: 'string' },
        description: 'The direction of icon.',
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
    fill: {
        name: 'fill',
        type: { name: 'boolean' },
        description: 'Whether to fill icon or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    width: {
        name: 'width',
        type: { name: 'string' },
        description: 'The width of icon.',
        defaultValue: '1.5rem',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"1.5rem"',
            },
        },
        control: {
            type: 'text',
        },
    },
    height: {
        name: 'height',
        type: { name: 'string' },
        description: 'The height of icon.',
        defaultValue: '1.5rem',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"1.5rem"',
            },
        },
        control: {
            type: 'text',
        },
    },
    scale: {
        name: 'scale',
        type: { name: 'string' },
        description: 'The scale of icon.',
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
    color: {
        name: 'color',
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
    original: {
        name: 'original',
        type: { name: 'boolean' },
        description: 'Whether to use original icon or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    title: {
        name: 'title',
        type: { name: 'string' },
        description: 'The title of icon.',
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
    animation: {
        name: 'animation',
        type: { name: 'string' },
        description: `Animation type. ${Object.values(ANIMATION_TYPE).map((d) => `'${d}'`)} are available.`,
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
            type: 'select',
            options: Object.values(ANIMATION_TYPE),
        },
    },
});
