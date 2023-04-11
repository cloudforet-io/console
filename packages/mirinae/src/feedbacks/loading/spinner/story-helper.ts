import type { ArgTypes } from '@storybook/addons';

import { SPINNER_SIZE, SPINNER_STYLE_TYPE } from '@/feedbacks/loading/spinner/type';

export const getSpinnerArgTypes = (): ArgTypes => ({
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'spinner size',
        defaultValue: SPINNER_SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: SPINNER_SIZE.md,
            },
            category: 'props',
        },
        control: {
            type: 'select',
            options: Object.values(SPINNER_SIZE),
        },
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'spinner style ',
        defaultValue: SPINNER_STYLE_TYPE.gray,
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: SPINNER_STYLE_TYPE.gray,
            },
            category: 'props',
        },
        control: {
            type: 'select',
            options: Object.values(SPINNER_STYLE_TYPE),
        },
    },
});
