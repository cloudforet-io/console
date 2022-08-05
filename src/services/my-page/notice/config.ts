export const NOTICE_TYPE = Object.freeze({
    SYSTEM: 'SYSTEM',
    DOMAIN: 'DOMAIN',
});
export type NoticeType = typeof NOTICE_TYPE[keyof typeof NOTICE_TYPE];
