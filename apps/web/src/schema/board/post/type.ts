import type { NOTICE_POST_TYPE } from '@/schema/board/post/constant';

export type NoticePostType = typeof NOTICE_POST_TYPE[keyof typeof NOTICE_POST_TYPE];
