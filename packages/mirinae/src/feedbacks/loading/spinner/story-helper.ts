import { SPINNER_SIZE, SPINNER_STYLE_TYPE } from '@/feedbacks/loading/spinner/type';

export const getSpinnerDefaultArgs = () => ({
    size: SPINNER_SIZE.md,
    styleType: SPINNER_STYLE_TYPE.gray,
});

export const getSpinnerArgTypes = () => ({
    size: {
        name: 'size',
        type: 'string',
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
        type: 'string',
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
