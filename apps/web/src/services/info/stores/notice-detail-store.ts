import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PostCreateParameters } from '@/schema/board/post/api-verbs/create';
import type { PostDeleteParameters } from '@/schema/board/post/api-verbs/delete';
import type { PostGetParameters } from '@/schema/board/post/api-verbs/get';
import type { PostUpdateParameters } from '@/schema/board/post/api-verbs/update';
import type { PostModel } from '@/schema/board/post/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useNoticeDetailStore = defineStore('notice-detail', () => {
    const state = reactive({
        post: undefined as undefined | PostModel,
    });

    const getters = reactive({});

    const actions = {
        getNoticePost: async (postId: string) => {
            try {
                const result = await SpaceConnector.clientV2.board.post.get<PostGetParameters, PostModel>({
                    post_id: postId,
                });
                state.post = result;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.post = undefined;
            }
        },
        deleteNoticePost: async (postId: string) => {
            await SpaceConnector.clientV2.board.post.delete<PostDeleteParameters>({
                post_id: postId,
            });
            state.post = undefined;
        },
        updateNoticePost: async (params: Omit<PostUpdateParameters, 'post_id'>) => {
            if (!state.post) throw new Error('Notice post not found');
            const post = await SpaceConnector.clientV2.board.post.update<PostUpdateParameters, PostModel>({
                ...params,
                post_id: state.post.post_id,
            });
            state.post = post;
        },
        createNoticePost: async (params: Omit<PostCreateParameters, 'post_id'>) => {
            await SpaceConnector.clientV2.board.post.create(params);
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
