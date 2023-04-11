import type { ArgTypes } from '@storybook/addons';

import { NOTICE_GROUP } from '@/feedbacks/alert/notice-alert/config';

export const getNoticeAlertArgTypes = (): ArgTypes => ({
    group: {
        name: 'group',
        type: { name: 'string' },
        description: '',
        defaultValue: NOTICE_GROUP.noticeBottomRight,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${NOTICE_GROUP.noticeBottomRight}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(NOTICE_GROUP),
        },
    },
});
