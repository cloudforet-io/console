<template>
    <fragment>
        <notice-popup-item
            v-for="(item, index) in popupList"
            :key="`notice-item-${index}`"
            :popup-index="index"
            :item="item"
        />
    </fragment>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

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
            isSessionExpired: computed(() => store.state.user.isSessionExpired),
            popupList: [] as Array<NoticePostModel>,
        });


        const apiQuery = new ApiQueryHelper().setFilters([{
            k: 'name',
            v: 'console:board',
            o: '',
        }, {
            k: 'data.show_popup',
            v: false,
            o: '=',
        }]).data;
        const getUserConfigBoardPostIdList = async (): Promise<Array<string>> => {
            try {
                const { results } = await SpaceConnector.client.config.userConfig.list({
                    user_id: store.state.user.userId,
                    query: apiQuery,
                });
                // console:board:{boardId}:{postId}
                return results.map(d => d.name.split(':')[3]);
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const getNoticeBoard = async (): Promise<string|undefined> => {
            try {
                const { results } = await SpaceConnector.client.board.board.list();
                return results.filter(d => d.name === 'Notice')[0]?.board_id;
            } catch (e) {
                ErrorHandler.handleError(e);
                return undefined;
            }
        };

        const getPostList = async () => {
            try {
                const noticeBoard = await getNoticeBoard();
                if (!noticeBoard) return;
                const { results } = await SpaceConnector.client.board.post.list({
                    board_id: noticeBoard,
                    query: {
                        filter: [{
                            k: 'options.is_popup',
                            v: true,
                            o: 'eq',
                        }],
                    },
                });
                const postIdList = await getUserConfigBoardPostIdList();
                state.popupList = results.filter(d => !postIdList.includes(d.post_id));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.popupList = [];
            }
        };

        watch(() => state.isSessionExpired, async (isSessionExpired) => {
            if (isSessionExpired === false) await getPostList();
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>
