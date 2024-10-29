<script setup lang="ts">
import {
    computed, onBeforeMount, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButton, PHeading, PHeadingLayout } from '@cloudforet/mirinae';

import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { PostSendParameters } from '@/schema/board/post/api-verbs/send';
import type { PostModel } from '@/schema/board/post/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import {
    hideLoadingMessage,
    showErrorMessage,
    showLoadingMessage,
    showSuccessMessage,
} from '@/lib/helper/notice-alert-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import NoticeDetail from '@/services/info/components/NoticeDetail.vue';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';


const props = defineProps<{
    postId: string;
}>();

const { getProperRouteLocation } = useProperRouteLocation();
const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;
const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

const storeState = reactive({
    post: computed<undefined|PostModel>(() => noticeDetailState.post),
    pageAccessPermissionMap: computed<PageAccessMap>(() => userStore.getters.pageAccessPermissionMap),
});
const state = reactive({
    hasPermissionToEditOrDelete: computed<boolean>(() => userStore.getters.isDomainAdmin),
    deleteModalVisible: false,
    sendLoading: false,
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
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
        hideLoadingMessage(loadingMessageId);
        showErrorMessage(i18n.t('INFO.NOTICE.DETAIL.ALT_E_SEND_EMAIL'), e);
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
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="noticeDetailState.post?.title"
                           show-back-button
                           @click-back-button="$router.go(-1)"
                />
            </template>
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <div v-if="state.hasPermissionToEditOrDelete"
                     class="button-group"
                >
                    <p-button v-if="storeState.post?.resource_group !== RESOURCE_GROUP.SYSTEM"
                              style-type="tertiary"
                              icon-left="ic_edit"
                              @click="handleClickEditButton"
                    >
                        {{ $t('INFO.NOTICE.FORM.EDIT') }}
                    </p-button>
                    <p-button v-if="storeState.post?.resource_group !== RESOURCE_GROUP.SYSTEM"
                              style-type="tertiary"
                              icon-left="ic_paper-airplane"
                              :loading="state.sendLoading"
                              @click="handleClickSendEmail"
                    >
                        {{ $t('INFO.NOTICE.FORM.SEND_EMAIL_MODAL_TITLE') }}
                    </p-button>
                    <p-button v-if="storeState.post?.resource_group !== RESOURCE_GROUP.SYSTEM"
                              style-type="negative-secondary"
                              @click="handleDeleteModalOpen"
                    >
                        {{ $t('INFO.NOTICE.FORM.DELETE') }}
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
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
