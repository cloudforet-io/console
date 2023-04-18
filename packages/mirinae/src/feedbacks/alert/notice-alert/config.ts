export const NOTICE_GROUP = {
    noticeTopLeft: 'noticeTopLeft',
    noticeTopRight: 'noticeTopRight',
    noticeBottomLeft: 'noticeBottomLeft',
    noticeBottomRight: 'noticeBottomRight',
} as const;

export type NoticeGroup = typeof NOTICE_GROUP[keyof typeof NOTICE_GROUP];
export type NoticePosition = 'top left' | 'top right' | 'bottom left' | 'bottom right';

export const NOTICE_GROUP_POSITION_MAP: Record<NoticeGroup, NoticePosition> = {
    [NOTICE_GROUP.noticeTopLeft]: 'top left',
    [NOTICE_GROUP.noticeTopRight]: 'top right',
    [NOTICE_GROUP.noticeBottomLeft]: 'bottom left',
    [NOTICE_GROUP.noticeBottomRight]: 'bottom right',
};
