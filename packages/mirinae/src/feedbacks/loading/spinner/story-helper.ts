import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { SPINNER_SIZE, SPINNER_STYLE_TYPE } from '@/feedbacks/loading/spinner/type';

export const getSpinnerArgs = (): Args => ({
    size: SPINNER_SIZE.md,
    styleType: SPINNER_STYLE_TYPE.gray,
});

export const getSpinnerParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=5687%3A372907&viewport=-33728%2C-44113%2C1.65',
    },
});

export const getSpinnerArgTypes = (): ArgTypes => ({
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'spinner size',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: SPINNER_SIZE.md,
            },
            category: 'props',
        },
        control: 'select',
        options: Object.values(SPINNER_SIZE),
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'spinner style ',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: SPINNER_STYLE_TYPE.gray,
            },
            category: 'props',
        },
        control: 'select',
        options: Object.values(SPINNER_STYLE_TYPE),
    },
});
