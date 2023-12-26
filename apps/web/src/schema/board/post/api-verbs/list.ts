import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { PostBoardType } from '@/schema/board/post/type';

export interface PostListParameters {
    query?: Query;
    board_type?: PostBoardType;
    post_id?: string;
    category?: string;
    writer?: string;
    is_pinned?: boolean;
    is_popup?: boolean;
    domain_id?: string;
}
