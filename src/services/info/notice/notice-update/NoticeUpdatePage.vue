<template>
    <div class="notice-update-page">
        <p-heading :title="$t('INFO.NOTICE.FORM.EDIT_TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-form :board-id="boardId"
                     type="EDIT"
                     :notice-post-data="noticePostData"
        />
    </div>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from 'vue';

import { PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NoticeForm from '@/services/info/notice/modules/NoticeForm.vue';
import type { NoticePostModel } from '@/services/info/notice/type';

export default {
    name: 'NoticeUpdatePage',
    components: {
        NoticeForm,
        PHeading,
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

        watch(() => state.noticePostData, (d) => {
            // System can access to every update page
            if (store.getters['user/hasSystemRole']) return;
            // Domain can access to only their update page
            if (
                d.scope === 'PUBLIC'
                || !(d.scope === 'DOMAIN' && store.getters['user/hasDomainRole'])
            ) SpaceRouter.router.back();
        });

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
