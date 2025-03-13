import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CommentCreateParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/create';
import type { CommentDeleteParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/delete';
import type { CommentGetParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/get';
import type { CommentListParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/list';
import type { CommentUpdateParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/update';
import type { CommentModel } from '@/api-clients/opsflow/comment/schema/model';

interface UseCommentApiReturn {
    commentQueryKey: ComputedRef<QueryKey>;
    commentListQueryKey: ComputedRef<QueryKey>;
    commentAPI: {
        create: (params: CommentCreateParameters) => Promise<CommentModel>;
        update: (params: CommentUpdateParameters) => Promise<CommentModel>;
        delete: (params: CommentDeleteParameters) => Promise<void>;
        get: (params: CommentGetParameters) => Promise<CommentModel>;
        list: (params: CommentListParameters) => Promise<ListResponse<CommentModel>>;
    }
}

export const useCommentApi = (): UseCommentApiReturn => {
    const commentQueryKey = useAPIQueryKey('opsflow', 'comment', 'get');
    const commentListQueryKey = useAPIQueryKey('opsflow', 'comment', 'list');

    const actions = {
        async create(params: CommentCreateParameters) {
            return SpaceConnector.clientV2.opsflow.comment.create<CommentCreateParameters, CommentModel>(params);
        },
        async update(params: CommentUpdateParameters) {
            return SpaceConnector.clientV2.opsflow.comment.update<CommentUpdateParameters, CommentModel>(params);
        },
        async delete(params: CommentDeleteParameters) {
            return SpaceConnector.clientV2.opsflow.comment.delete<CommentDeleteParameters>(params);
        },
        async get(params: CommentGetParameters) {
            return SpaceConnector.clientV2.opsflow.comment.get<CommentGetParameters, CommentModel>(params);
        },
        async list(params: CommentListParameters) {
            return SpaceConnector.clientV2.opsflow.comment.list<CommentListParameters, ListResponse<CommentModel>>(params);
        },
    };

    return {
        commentQueryKey,
        commentListQueryKey,
        commentAPI: actions,
    };
};
