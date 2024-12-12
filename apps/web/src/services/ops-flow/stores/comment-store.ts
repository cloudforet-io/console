import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CommentCreateParameters } from '@/schema/opsflow/comment/api-verbs/create';
import type { CommentDeleteParameters } from '@/schema/opsflow/comment/api-verbs/delete';
import type { CommentGetParameters } from '@/schema/opsflow/comment/api-verbs/get';
import type { CommentListParameters } from '@/schema/opsflow/comment/api-verbs/list';
import type { CommentUpdateParameters } from '@/schema/opsflow/comment/api-verbs/update';
import type { CommentModel } from '@/schema/opsflow/comment/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

interface UseCommentStoreState {
    itemsByTaskId: Record<string, CommentModel[]|undefined>;
}
export const useCommentStore = defineStore('comment', () => {
    const state = reactive<UseCommentStoreState>({
        itemsByTaskId: {},
    });

    const comments = computed<CommentModel[]>(() => Object.values(state.itemsByTaskId).flat().filter((c) => c) as CommentModel[]);

    const fetchList = getCancellableFetcher<CommentListParameters, ListResponse<CommentModel>>(SpaceConnector.clientV2.opsflow.comment.list);
    const actions = {
        /*
         * @return {CommentModel[]|undefined} It returns undefined if the request is canceled.
         */
        async listByTaskId(taskId: string, params: CommentListParameters = {}): Promise<CommentModel[]|undefined> {
            if (state.itemsByTaskId[taskId]) {
                return state.itemsByTaskId[taskId];
            }
            const res = await actions.list({
                ...params,
                task_id: taskId,
            });
            if (res) {
                state.itemsByTaskId = { ...state.itemsByTaskId, [taskId]: res };
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
            const taskId = response.task_id;
            if (state.itemsByTaskId[taskId]) {
                if (addToFront) state.itemsByTaskId[taskId]?.unshift(response);
                else state.itemsByTaskId[taskId]?.push(response);
            } else {
                state.itemsByTaskId[taskId] = [response];
            }
            state.itemsByTaskId = { ...state.itemsByTaskId }; // trigger reactivity
            return response;
        },
        async update(params: CommentUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.comment.update<CommentUpdateParameters, CommentModel>(params);
            const taskId = response.task_id;
            if (state.itemsByTaskId[taskId]) {
                const comment = state.itemsByTaskId[taskId]?.find((c) => c.comment_id === response.comment_id);
                if (comment) {
                    Object.assign(comment, response);
                }
            } else {
                state.itemsByTaskId[taskId] = [response];
            }
            state.itemsByTaskId = { ...state.itemsByTaskId }; // trigger reactivity
            return response;
        },
        async get(commentId: string) {
            const response = await SpaceConnector.clientV2.opsflow.comment.get<CommentGetParameters, CommentModel>({
                comment_id: commentId,
            });
            if (state.itemsByTaskId[response.task_id]) {
                const comment = state.itemsByTaskId[response.task_id]?.find((c) => c.comment_id === response.comment_id);
                if (comment) {
                    Object.assign(comment, response);
                }
            } else {
                state.itemsByTaskId[response.task_id] = [response];
            }
            return response;
        },
        async delete(commentId: string) {
            await SpaceConnector.clientV2.opsflow.comment.delete<CommentDeleteParameters, CommentModel>({
                comment_id: commentId,
            });
            const taskId = comments.value.find((c) => c.comment_id === commentId)?.task_id;
            if (taskId) {
                state.itemsByTaskId[taskId] = state.itemsByTaskId[taskId]?.filter((c) => c.comment_id !== commentId);
            }
        },
        reset() {
            state.itemsByTaskId = {};
        },
    };

    const disposeSelf = () => {
        const store = useCommentStore();
        store.reset();
        store.$dispose();
    };
    const appContextStore = useAppContextStore();
    watch([() => appContextStore.getters.isAdminMode, () => appContextStore.getters.workspaceId], () => {
        disposeSelf();
    });
    return {
        state,
        ...actions,
    };
});
