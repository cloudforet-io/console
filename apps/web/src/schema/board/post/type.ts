import type { POST_BOARD_TYPE } from '@/schema/board/post/constant';

export type PostBoardType = typeof POST_BOARD_TYPE[keyof typeof POST_BOARD_TYPE];

export interface NoticeConfigData {
    is_read?: boolean,
    show_popup?: boolean,
}
