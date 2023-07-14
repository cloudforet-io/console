<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PHeading } from '@spaceone/design-system';
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NoticeForm from '@/services/info/notice/modules/NoticeForm.vue';
import type { NoticePostModel } from '@/services/info/notice/type';

interface Props {
    boardId?: string;
    postId?: string;
}

const props = defineProps<Props>();
const store = useStore();
const { t } = useI18n();
const router = useRouter();

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
    ) router.back();
});

/* Init */
(async () => {
    await getNoticePostData();
})();

</script>

<template>
    <div class="notice-update-page">
        <p-heading :title="t('INFO.NOTICE.FORM.EDIT_TITLE')"
                   show-back-button
                   @click-back-button="router.go(-1)"
        />
        <notice-form :board-id="boardId"
                     type="EDIT"
                     :notice-post-data="state.noticePostData"
        />
    </div>
</template>
