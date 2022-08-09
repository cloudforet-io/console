export const NOTICE_TYPE = {
    SYSTEM: 'SYSTEM',
    DOMAIN: 'DOMAIN',
} as const;
export type NoticeType = typeof NOTICE_TYPE[keyof typeof NOTICE_TYPE];
