import type { ArgTypes, Args, Parameters } from '@storybook/vue';
import icon from 'vue-svgicon';

import { ANIMATION_TYPE } from '@/foundation/icons/config';


export const getAllAvailableIcons = () => Object.keys(icon.icons);

export const getIconArgs = (): Args => ({
    name: '',
    dir: undefined,
    fill: true,
    width: '1.5rem',
    height: '1.5rem',
    scale: undefined,
    color: undefined,
    original: true,
    title: undefined,
    animation: undefined,
});

export const getIconsParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A123491',
    },
});

export const getIconsArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'The name of icon.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    dir: {
        name: 'dir',
        type: { name: 'string' },
        description: 'The direction of icon.',
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
    fill: {
        name: 'fill',
        type: { name: 'boolean' },
        description: 'Whether to fill icon or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: 'boolean',
    },
    width: {
        name: 'width',
        type: { name: 'string' },
        description: 'The width of icon.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"1.5rem"',
            },
        },
        control: 'text',
    },
    height: {
        name: 'height',
        type: { name: 'string' },
        description: 'The height of icon.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"1.5rem"',
            },
        },
        control: 'text',
    },
    scale: {
        name: 'scale',
        type: { name: 'string' },
        description: 'The scale of icon.',
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
    color: {
        name: 'color',
        type: { name: 'string' },
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
    original: {
        name: 'original',
        type: { name: 'boolean' },
        description: 'Whether to use original icon or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: 'boolean',
    },
    title: {
        name: 'title',
        type: { name: 'string' },
        description: 'The title of icon.',
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
    animation: {
        name: 'animation',
        type: { name: 'string' },
        description: `Animation type. ${Object.values(ANIMATION_TYPE).map((d) => `'${d}'`)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'select',
        options: Object.values(ANIMATION_TYPE),
    },
});
