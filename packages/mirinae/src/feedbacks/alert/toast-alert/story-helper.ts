import { TOAST_GROUP } from '@/feedbacks/alert/toast-alert/config';

export const getToastAlertDefaultArgs = () => ({
    group: TOAST_GROUP.toastTopCenter,
});

export const getToastAlertArgTypes = () => ({
    group: {
        name: 'group',
        type: 'string',
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
