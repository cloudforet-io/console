import type { ArgTypes, Parameters, Args } from '@storybook/vue';
import icon from 'vue-svgicon';

import { AVATAR_SIZE, AVATAR_COLOR } from '@/data-display/avatar/type';

export const getAvatarArgs = (): Args => ({
    imgSrc: '',
    icon: 'ic_avatar-filled',
    color: 'indigo200',
    size: AVATAR_SIZE.MD,
});

export const getAvatarParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'figma url',
    },
});

export const getAvatarArgTypes = (): ArgTypes => ({
    imgSrc: {
        name: 'imgSrc',
        type: { name: 'string' },
        description: 'Avartar Img Src',
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
    icon: {
        name: 'icon',
        type: { name: 'string' },
        description: 'Avartar Icon',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ic_avatar-filled',
            },
        },
        control: 'select',
        options: [null, ...Object.keys(icon.icons)],
    },
    color: {
        name: 'color',
        type: { name: 'string' },
        description: 'Avartar Color',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'indigo200',
            },
        },
        control: 'select',
        options: [...Object.keys(AVATAR_COLOR)],
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'Avartar size',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: AVATAR_SIZE.MD,
            },
        },
        control: 'select',
        options: [...Object.values(AVATAR_SIZE)],
    },
});
