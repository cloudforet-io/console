import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PostCreateParameters } from '@/schema/board/post/api-verbs/create';
import type { PostDeleteParameters } from '@/schema/board/post/api-verbs/delete';
import type { PostGetParameters } from '@/schema/board/post/api-verbs/get';
import type { PostUpdateParameters } from '@/schema/board/post/api-verbs/update';
import type { PostModel } from '@/schema/board/post/model';

import { getNoticeBoardId } from '@/lib/helper/notice-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useNoticeDetailStore = defineStore('notice-detail', () => {
    const state = reactive({
        boardId: undefined as undefined | string,
        post: undefined as undefined | PostModel,
    });

    const setBoardId = async (boardId?: string) => {
        if (boardId && boardId === state.boardId) return;
        state.boardId = await getNoticeBoardId();
    };
    const actions = {
        getNoticePost: async (postId: string, boardId?: string) => {
            try {
                await setBoardId(boardId);
                if (!state.boardId) throw new Error('Notice board not found');

                const result = await SpaceConnector.clientV2.board.post.get<PostGetParameters, PostModel>({
                    board_id: state.boardId,
                    post_id: postId,
                });
                state.post = result;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        deleteNoticePost: async (postId: string) => {
            if (!state.boardId) throw new Error('Notice board not found');
            await SpaceConnector.clientV2.board.post.delete<PostDeleteParameters>({
                post_id: postId,
                board_id: state.boardId,
            });
            state.post = undefined;
        },
        updateNoticePost: async (params: PostUpdateParameters) => {
            const post = await SpaceConnector.clientV2.board.post.update<PostUpdateParameters, PostModel>(params);
            state.post = post;
        },
        createNoticePost: async (params: PostCreateParameters) => {
            await SpaceConnector.clientV2.board.post.create(params);
        },
        reset: () => {
            state.boardId = undefined;
            state.post = undefined;
        },
    };

    return {
        state,
        ...actions,
    };
});
