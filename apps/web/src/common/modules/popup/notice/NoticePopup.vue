<template>
    <fragment>
        <notice-popup-item
            v-for="(item, index) in popupList"
            v-show="!isSessionExpired"
            :key="`notice-item-${index}`"
            :popup-index="index"
            :item="item"
        />
    </fragment>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { PostListParameters, PostListResponse } from '@/schema/board/post/api-verbs/list';
import type { PostModel } from '@/schema/board/post/model';
import { store } from '@/store';

import { useNoticeStore } from '@/store/notice';

import ErrorHandler from '@/common/composables/error/errorHandler';
import NoticePopupItem from '@/common/modules/popup/notice/modules/NoticePopupItem.vue';



export default {
    name: 'NoticePopup',
    components: {
        NoticePopupItem,
    },
    setup() {
        const noticeStore = useNoticeStore();
        const noticeGetters = noticeStore.getters;

        const state = reactive({
            isSessionExpired: computed<boolean>(() => store.state.user.isSessionExpired),
            isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
            popupList: [] as Array<PostModel>,
        });

        // helper
        const apiQueryForPostIdList = new ApiQueryHelper().setFilters([{
            k: 'name',
            v: 'console:board',
            o: '',
        }, {
            k: 'data.show_popup',
            v: false,
            o: '=',
        }]).data;
        const apiQueryForPostList = new ApiQueryHelper().setFilters([{
            k: 'options.is_popup',
            v: true,
            o: '=',
        }]).setSort('created_at', false).data;

        // API
        const getUserConfigBoardPostIdList = async (): Promise<Array<string>> => {
            try {
                const { results } = await SpaceConnector.client.config.userConfig.list({
                    user_id: store.state.user.userId,
                    query: apiQueryForPostIdList,
                });
                // console:board:{boardId}:{postId}
                return results.map((d) => d.name.split(':')[3]);
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const getPostList = async (): Promise<void> => {
            try {
                if (!noticeGetters.boardId) throw new Error('Notice board not found');
                const { results } = await SpaceConnector.clientV2.board.post.list<PostListParameters, PostListResponse>({
                    domain_id: null,
                    board_id: noticeGetters.boardId,
                    query: apiQueryForPostList,
                });
                const postIdList = await getUserConfigBoardPostIdList();
                state.popupList = results?.filter((d) => !postIdList.includes(d.post_id)) ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.popupList = [];
            }
        };

        watch(() => state.isSessionExpired, async (isSessionExpired) => {
            if (!isSessionExpired && !state.isNoRoleUser) await getPostList();
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>
