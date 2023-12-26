import type { NOTICE_POST_TYPE, POST_BOARD_TYPE } from '@/schema/board/post/constant';

export type NoticePostType = typeof NOTICE_POST_TYPE[keyof typeof NOTICE_POST_TYPE];

export type PostBoardType = typeof POST_BOARD_TYPE[keyof typeof POST_BOARD_TYPE];

export interface NoticeConfigData {
    is_read?: boolean,
    show_popup?: boolean,
}

export type PostResourceGroup = 'SYSTEM' | 'DOMAIN';
