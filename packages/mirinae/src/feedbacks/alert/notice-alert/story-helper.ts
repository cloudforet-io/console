import type { Parameters, Args, ArgTypes } from '@storybook/vue';

import { NOTICE_GROUP } from '@/feedbacks/alert/notice-alert/config';

export const getNoticeAlertArgs = (): Args => ({
    group: NOTICE_GROUP.noticeBottomRight,
});

export const getNoticeAlertParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=10%3A88958&t=kwTRXVZQtJLDw0Ei-4',
    },
});

export const getNoticeAlertArgTypes = (): ArgTypes => ({
    group: {
        name: 'group',
        type: { name: 'string' },
        description: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${NOTICE_GROUP.noticeBottomRight}"`,
            },
        },
        control: 'select',
        options: Object.values(NOTICE_GROUP),
    },
});
