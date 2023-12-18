import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PostModel } from '@/schema/board/post/model';

export interface PostListParameters {
    board_id: string;
    post_id?: string;
    category?: string;
    writer?: string;
    is_pinned?: boolean;
    is_popup?: boolean;
    user_id?: string;
    domain_id?: string|null;
    query?: Query;
}

export type PostListResponse = ListResponse<PostModel>;
