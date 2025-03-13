import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { CommentType } from '@/api-clients/opsflow/comment/schema/type';

export interface CommentListParameters {
    query?: Query;
    task_id?: string;
    comment_id?: string;
    comment_type?: CommentType;
    user_id?: string;
    user_group_id?: string;
    project_id?: string;
    workspace_id?: string;
}
