import { NOTICE_GROUP } from '@/feedbacks/alert/notice-alert/config';

export const getNoticeAlertDefaultArgs = () => ({
    group: NOTICE_GROUP.noticeBottomRight,
});

export const getNoticeAlertArgTypes = () => ({
    group: {
        name: 'group',
        type: 'string',
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
