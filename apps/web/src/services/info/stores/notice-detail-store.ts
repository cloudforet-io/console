import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PostCreateParameters } from '@/schema/board/post/api-verbs/create';
import type { PostDeleteParameters } from '@/schema/board/post/api-verbs/delete';
import type { PostGetParameters } from '@/schema/board/post/api-verbs/get';
import type { PostUpdateParameters } from '@/schema/board/post/api-verbs/update';
import type { PostModel } from '@/schema/board/post/model';

import { useNoticeStore } from '@/store/notice';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useNoticeDetailStore = defineStore('notice-detail', () => {
    const noticeStore = useNoticeStore();
    const noticeGetters = noticeStore.getters;

    const state = reactive({
        post: undefined as undefined | PostModel,
    });

    const getters = reactive({
        boardId: computed<string|undefined>(() => noticeGetters.boardId),
    });

    const actions = {
        getNoticePost: async (postId: string) => {
            try {
                if (!getters.boardId) throw new Error('Notice board not found');

                const result = await SpaceConnector.clientV2.board.post.get<PostGetParameters, PostModel>({
                    board_id: getters.boardId,
                    post_id: postId,
                });
                state.post = result;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.post = undefined;
            }
        },
        deleteNoticePost: async (postId: string) => {
            if (!getters.boardId) throw new Error('Notice board not found');
            await SpaceConnector.clientV2.board.post.delete<PostDeleteParameters>({
                post_id: postId,
                board_id: getters.boardId,
            });
            state.post = undefined;
        },
        updateNoticePost: async (params: Omit<PostUpdateParameters, 'board_id'|'post_id'>) => {
            if (!getters.boardId) throw new Error('Notice board not found');
            if (!state.post) throw new Error('Notice post not found');
            const post = await SpaceConnector.clientV2.board.post.update<PostUpdateParameters, PostModel>({
                ...params,
                post_id: state.post.post_id,
                board_id: getters.boardId,
            });
            state.post = post;
        },
        createNoticePost: async (params: Omit<PostCreateParameters, 'board_id'>) => {
            if (!getters.boardId) throw new Error('Notice board not found');
            await SpaceConnector.clientV2.board.post.create({ ...params, board_id: getters.boardId });
        },
        reset: () => {
            state.post = undefined;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
