import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { PostBoardType } from '@/schema/board/post/type';

export interface PostListParameters {
    post_id?: string;
    board_type?: PostBoardType;
    category?: string;
    writer?: string;
    is_pinned?: boolean;
    is_popup?: boolean;
    query?: Query;
}
