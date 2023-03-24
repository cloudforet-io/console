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

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import NoticePopupItem from '@/common/modules/popup/notice/modules/NoticePopupItem.vue';

import type { NoticePostModel } from '@/services/info/notice/type';

export default {
    name: 'NoticePopup',
    components: {
        NoticePopupItem,
    },
    setup() {
        const state = reactive({
            isSessionExpired: computed<boolean>(() => store.state.user.isSessionExpired),
            isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
            popupList: [] as Array<NoticePostModel>,
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

        const getNoticeBoard = async (): Promise<string|undefined> => {
            try {
                const { results } = await SpaceConnector.client.board.board.list();
                return results.filter((d) => d.name === 'Notice')[0]?.board_id;
            } catch (e) {
                ErrorHandler.handleError(e);
                return undefined;
            }
        };

        const getPostList = async (): Promise<void> => {
            try {
                const noticeBoard = await getNoticeBoard();
                if (!noticeBoard) return;
                const { results } = await SpaceConnector.client.board.post.list({
                    domain_id: null,
                    board_id: noticeBoard,
                    query: apiQueryForPostList,
                });
                const postIdList = await getUserConfigBoardPostIdList();
                state.popupList = results.filter((d) => !postIdList.includes(d.post_id));
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
