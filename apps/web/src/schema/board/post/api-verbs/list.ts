import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { PostModel } from '@/schema/board/post/model';

export interface PostListParameters {
    board_id: string;
    post_id?: string;
    category?: string;
    writer?: string;
    is_pinned?: boolean;
    is_popup?: boolean;
    permission_group?: 'GLOBAL'|'DOMAIN';
    user_id?: string;
    domain_id?: string|null;
    query?: Query;
}

export interface PostListResponse {
    results: PostModel[];
    total_count: number;
}
