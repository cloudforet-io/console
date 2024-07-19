import type { Args, ArgTypes, Parameters } from '@storybook/vue';

import { TOAST_GROUP } from '@/feedbacks/alert/toast-alert/config';

export const getToastAlertArgs = (): Args => ({
    group: TOAST_GROUP.toastTopCenter,
});

export const getToastAlertParameters = ():Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=10%3A88918&t=kwTRXVZQtJLDw0Ei-4',
    },
});

export const getToastAlertArgTypes = (): ArgTypes => ({
    group: {
        name: 'group',
        type: { name: 'string' },
        description: 'Name of target toast group.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${TOAST_GROUP.toastTopCenter}"`,
            },
        },
        control: 'select',
        options: Object.values(TOAST_GROUP),
    },
});
