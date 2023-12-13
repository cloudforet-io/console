<script setup lang="ts">
import {
    computed, onBeforeMount, reactive,
} from 'vue';

import { PButton, PHeading } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { NOTICE_POST_TYPE } from '@/schema/board/post/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import NoticeDetail from '@/services/info/components/NoticeDetail.vue';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';


const props = defineProps<{
    postId: string;
}>();

const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;
const noticeDetailGetters = noticeDetailStore.getters;

const state = reactive({
    hasDomainRoleUser: computed<boolean>(() => store.getters['user/hasDomainRole']),
    hasSystemRoleUser: computed<boolean>(() => store.getters['user/hasSystemRole']),
    hasPermissionToEditOrDelete: computed<boolean>(() => {
        if (state.postType === NOTICE_POST_TYPE.SYSTEM) return state.hasSystemRoleUser;
        return state.hasDomainRoleUser || state.hasSystemRoleUser;
    }),
    deleteModalVisible: false,
});

const handleClickEditButton = () => {
    if (!noticeDetailGetters.boardId || !props.postId) {
        ErrorHandler.handleError(new Error('boardId or postId is undefined'));
        return;
    }
    SpaceRouter.router.push({
        name: INFO_ROUTE.NOTICE.UPDATE._NAME,
        params: { boardId: noticeDetailGetters.boardId, postId: props.postId },
    });
};

const handleDeleteModalOpen = () => {
    state.deleteModalVisible = true;
};

const handleDeleteNoticeConfirm = async () => {
    try {
        if (!props.postId) throw new Error('postId is undefined');
        await noticeDetailStore.deleteNoticePost(props.postId);
        showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_DELETE_NOTICE'), '');
        await SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_DELETE_NOTICE'));
    } finally {
        state.deleteModalVisible = false;
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
