export const NOTICE_POST_TYPE = {
    SYSTEM: 'SYSTEM',
    INTERNAL: 'INTERNAL',
} as const;
export type NoticePostType = typeof NOTICE_POST_TYPE[keyof typeof NOTICE_POST_TYPE];
