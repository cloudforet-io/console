<template>
    <div class="notice-update-page">
        <p-page-title title="Edit Notice" @go-back="$router.go(-1)" />
        <notice-form :board-id="boardId"
                     type="EDIT"
                     :notice-post-data="noticePostData"
        />
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { PPageTitle } from '@spaceone/design-system';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NoticeForm from '@/services/info/notice/modules/NoticeForm.vue';
import type { NoticePostModel } from '@/services/info/notice/type';


export default {
    name: 'NoticeUpdatePage',
    components: {
        NoticeForm,
        PPageTitle,
    },
    props: {
        boardId: {
            type: String,
            default: undefined,
        },
        postId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            noticePostData: {} as Partial<NoticePostModel>,
        });

        /* Api */
        const getNoticePostData = async () => {
            try {
                state.noticePostData = await SpaceConnector.client.board.post.get({
                    board_id: props.boardId,
                    post_id: props.postId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                state.noticePostData = {};
            }
        };

        /* Init */
        (async () => {
            await getNoticePostData();
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>
