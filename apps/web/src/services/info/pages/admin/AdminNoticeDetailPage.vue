<script setup lang="ts">
import {
    computed, onBeforeMount, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton, PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PostSendParameters } from '@/schema/board/post/api-verbs/send';
import { store } from '@/store';
import { i18n } from '@/translations';

import { hideLoadingMessage, showLoadingMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import NoticeDetail from '@/services/info/components/NoticeDetail.vue';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';

const props = defineProps<{
    postId: string;
}>();

const { getProperRouteLocation } = useProperRouteLocation();
const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;

const router = useRouter();

const state = reactive({
    hasPermissionToEditOrDelete: computed<boolean>(() => store.getters['user/isDomainAdmin']),
    deleteModalVisible: false,
    sendLoading: false,
});

const handleClickEditButton = () => {
    if (!props.postId) {
        ErrorHandler.handleError(new Error('postId is undefined'));
        return;
    }
    router.push(getProperRouteLocation({
        name: INFO_ROUTE.NOTICE.UPDATE._NAME,
        params: { postId: props.postId },
    }));
};

const handleDeleteModalOpen = () => {
    state.deleteModalVisible = true;
};

const handleDeleteNoticeConfirm = async () => {
    try {
        if (!props.postId) throw new Error('postId is undefined');
        await noticeDetailStore.deleteNoticePost(props.postId);
        showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_DELETE_NOTICE'), '');
        await router.push(getProperRouteLocation({ name: INFO_ROUTE.NOTICE._NAME }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_DELETE_NOTICE'));
    } finally {
        state.deleteModalVisible = false;
    }
};
const handleClickSendEmail = async () => {
    state.sendLoading = true;
    const loadingMessageId = showLoadingMessage(i18n.t('INFO.NOTICE.DETAIL.ALT_S_SENDING'), '');

    try {
        const delayHideLoadingMessage = new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });

        await Promise.all([
            SpaceConnector.clientV2.board.post.send<PostSendParameters>({
                post_id: props.postId,
            }),
            delayHideLoadingMessage,
        ]);

        hideLoadingMessage(loadingMessageId);
        showSuccessMessage(i18n.t('INFO.NOTICE.DETAIL.ALT_S_SEND_EMAIL'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.sendLoading = false;
    }
};

onBeforeMount(async () => {
    noticeDetailStore.reset(); // do not reset on unmounted for the case of moving to update page
    await noticeDetailStore.getNoticePost(props.postId);
});
</script>

<template>
    <div>
        <p-heading :title="noticeDetailState.post?.title"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        >
            <template #extra>
                <div v-if="state.hasPermissionToEditOrDelete"
                     class="button-group"
                >
                    <p-button style-type="tertiary"
                              icon-left="ic_edit"
                              @click="handleClickEditButton"
                    >
                        {{ $t('INFO.NOTICE.FORM.EDIT') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              icon-left="ic_paper-airplane"
                              :loading="state.sendLoading"
                              @click="handleClickSendEmail"
                    >
                        {{ $t('INFO.NOTICE.FORM.SEND_EMAIL_MODAL_TITLE') }}
                    </p-button>
                    <p-button style-type="negative-secondary"
                              @click="handleDeleteModalOpen"
                    >
                        {{ $t('INFO.NOTICE.FORM.DELETE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <notice-detail :post-id="props.postId" />
        <delete-modal :header-title="$t('INFO.NOTICE.FORM.DELETE_MODAL_TITLE')"
                      :visible.sync="state.deleteModalVisible"
                      :contents="$t('INFO.NOTICE.FORM.DELETE_MODAL_CONTENTS')"
                      @confirm="handleDeleteNoticeConfirm"
        />
    </div>
</template>

<style scoped lang="postcss">
.button-group {
    @apply flex gap-2;
}
</style>
