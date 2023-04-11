import type { ArgTypes } from '@storybook/addons';

import { TOAST_GROUP } from '@/feedbacks/alert/toast-alert/config';

export const getToastAlertArgTypes = (): ArgTypes => ({
    group: {
        name: 'group',
        type: { name: 'string' },
        description: 'Name of target toast group.',
        defaultValue: TOAST_GROUP.toastTopCenter,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${TOAST_GROUP.toastTopCenter}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(TOAST_GROUP),
        },
    },
});
