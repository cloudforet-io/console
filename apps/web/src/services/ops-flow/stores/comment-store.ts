import { ref } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CommentCreateParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/create';
import type { CommentDeleteParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/delete';
import type { CommentListParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/list';
import type { CommentModel } from '@/api-clients/opsflow/comment/schema/model';

export const useCommentStore = defineStore('comment', () => {
    const comments = ref<CommentModel[]|undefined>();

    const fetchList = getCancellableFetcher<CommentListParameters, ListResponse<CommentModel>>(SpaceConnector.clientV2.opsflow.comment.list);
    const actions = {
        /*
         * @return {CommentModel[]|undefined} It returns undefined if the request is canceled.
         */
        async listByTaskId(taskId: string, params: CommentListParameters = {}): Promise<CommentModel[]|undefined> {
            if (comments.value) {
                return comments.value;
            }
            const res = await actions.list({
                ...params,
                task_id: taskId,
            });
            if (res) {
                comments.value = res;
            }
            return res;
        },
        /*
         * @return {CommentModel[]|undefined} It returns undefined if the request is canceled.
         */
        async list(params: CommentListParameters = {}): Promise<CommentModel[]|undefined> {
            const result = await fetchList({
                ...params,
                comment_type: 'COMMENT',
            });
            if (result.status === 'succeed') {
                return result.response.results ?? [];
            }
            return undefined;
        },
        async create(params: CommentCreateParameters, addToFront = false) {
            const response = await SpaceConnector.clientV2.opsflow.comment.create<CommentCreateParameters, CommentModel>(params);
            if (comments.value) {
                if (addToFront) comments.value.unshift(response);
                else comments.value.push(response);
            } else {
                comments.value = [response];
            }
            return response;
        },
        async delete(commentId: string) {
            await SpaceConnector.clientV2.opsflow.comment.delete<CommentDeleteParameters, CommentModel>({
                comment_id: commentId,
            });
            const taskId = comments.value?.find((c) => c.comment_id === commentId)?.task_id;
            if (taskId) {
                comments.value = comments.value?.filter((c) => c.comment_id !== commentId);
            }
        },
    };


    return {
        comments,
        ...actions,
    };
});
