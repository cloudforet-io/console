import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CommentCreateParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/create';
import type { CommentDeleteParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/delete';
import type { CommentGetParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/get';
import type { CommentListParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/list';
import type { CommentUpdateParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/update';
import type { CommentModel } from '@/api-clients/opsflow/comment/schema/model';

export const useCommentApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.opsflow.comment.create<CommentCreateParameters, CommentModel>,
        update: SpaceConnector.clientV2.opsflow.comment.update<CommentUpdateParameters, CommentModel>,
        delete: SpaceConnector.clientV2.opsflow.comment.delete<CommentDeleteParameters>,
        get: SpaceConnector.clientV2.opsflow.comment.get<CommentGetParameters, CommentModel>,
        list: SpaceConnector.clientV2.opsflow.comment.list<CommentListParameters, ListResponse<CommentModel>>,
    };

    return {
        commentAPI: actions,
    };
};
