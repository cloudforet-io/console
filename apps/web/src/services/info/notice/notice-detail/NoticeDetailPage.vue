<script lang="ts" setup>
import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBadge, PButton, PDataLoader, PDivider, PI, PHeading, PPaneLayout,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { useNoticeStore } from '@/store/notice';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFileAttachments } from '@/common/composables/file-attachments';

import { NOTICE_POST_TYPE } from '@/services/info/notice/config';
import { getPostBadgeInfo } from '@/services/info/notice/helper';
import ListItem from '@/services/info/notice/modules/list-item/ListItem.vue';
import type { NoticePostModel, NoticePostBadgeInfo } from '@/services/info/notice/type';
import { INFO_ROUTE } from '@/services/info/route-config';


interface Props {
    boardId: string;
    postId: string;
}

const props = withDefaults(defineProps<Props>(), {
    boardId: '',
    postId: '',
});
const { t } = useI18n();
const store = useStore();
const router = useRouter();


const state = reactive({
    timezone: computed(() => store.state.user.timezone),
    loading: false,
    noticePostData: {} as NoticePostModel,
    postType: computed(() => state.noticePostData.post_type),
    prevNoticePost: undefined as NoticePostModel | undefined,
    prevPostRoute: computed(() => ({
        name: INFO_ROUTE.NOTICE.DETAIL._NAME,
        params: { boardId: props.boardId, postId: state.prevNoticePost?.post_id },
    })),
    nextNoticePost: undefined as NoticePostModel | undefined,
    nextPostRoute: computed(() => ({
        name: INFO_ROUTE.NOTICE.DETAIL._NAME,
        params: { boardId: props.boardId, postId: state.nextNoticePost?.post_id },
    })),
    domainName: computed(() => store.state.domain.name),
    postDomainName: '',
    hasDomainRoleUser: computed(() => store.getters['user/hasDomainRole']),
    hasSystemRoleUser: computed(() => store.getters['user/hasSystemRole']),
    hasPermissionToEditOrDelete: computed(() => {
        if (state.postType === NOTICE_POST_TYPE.SYSTEM) return state.hasSystemRoleUser;
        return state.hasDomainRoleUser || state.hasSystemRoleUser;
    }),
    noticeTypeBadgeInfo: computed<NoticePostBadgeInfo>(() => getPostBadgeInfo(state.noticePostData?.post_type)),
});
const modalState = reactive({
    deleteModalVisible: false,
    // TODO: send email open state
});

const { attachments } = useFileAttachments(computed(() => state.noticePostData.files));

/* Api */
const getNoticePostData = async () => {
    try {
        const results = await SpaceConnector.client.board.post.get({
            board_id: props.boardId,
            post_id: props.postId,
        });
        state.noticePostData = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.noticePostData = {};
    }
};
const getNextPostData = async (createdAt) => {
    try {
        const nextPostApiQueryHelper = new ApiQueryHelper()
            .setPage(1, 1)
            .setSort('created_at', false)
            .setTimezone('UTC')
            .setFilters([{ k: 'created_at', v: createdAt, o: '>t' }]);
        if (state.domainName === 'root') {
            nextPostApiQueryHelper.setFilters([
                { k: 'post_type', v: NOTICE_POST_TYPE.SYSTEM, o: '=' },
                { k: 'created_at', v: createdAt, o: '>t' },
            ]);
        }
        const { results } = await SpaceConnector.client.board.post.list({
            domain_id: null,
            board_id: props.boardId,
            query: nextPostApiQueryHelper.data,
        });
        state.nextNoticePost = results.length ? results[0] : undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.nextNoticePost = undefined;
    }
};
const getPrevPostData = async (createdAt) => {
    try {
        const prevPostApiQueryHelper = new ApiQueryHelper()
            .setPage(1, 1)
            .setSort('created_at', true)
            .setTimezone('UTC')
            .setFilters([{ k: 'created_at', v: createdAt, o: '<t' }]);
        if (state.domainName === 'root') {
            prevPostApiQueryHelper.setFilters([
                { k: 'post_type', v: NOTICE_POST_TYPE.SYSTEM, o: '=' },
                { k: 'created_at', v: createdAt, o: '<t' },
            ]);
        }
        const { results } = await SpaceConnector.client.board.post.list({
            domain_id: null,
            board_id: props.boardId,
            query: prevPostApiQueryHelper.data,
        });
        state.prevNoticePost = results.length ? results[0] : undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.prevNoticePost = undefined;
    }
};
const getPostDomainName = async () => {
    if (!state.noticePostData?.domain_id) {
        state.postDomainName = 'All Domains';
        return;
    }
    try {
        const { name } = await SpaceConnector.client.identity.domain.get({ domain_id: state.noticePostData.domain_id });
        state.postDomainName = name;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.postDomainName = '';
    }
};

const {
    updateNoticeReadState,
} = useNoticeStore({
    userId: computed(() => store.state.user.userId),
});

/* Event */
const handleBackToListButtonClick = () => {
    router.push({ name: INFO_ROUTE.NOTICE._NAME });
};
// TODO: 이미지 URL 이슈로 인해 v1.10.1에서 제외
// const handleSendEmailConfirm = async () => {
//     try {
//         await SpaceConnector.client.board.post.sendNotification({
//             post_id: props.postId,
//             board_id: props.boardId,
//         });
//         showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_SEND_EMAIL'), '');
//     } catch (e) {
//         ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_SEND_EMAIL'));
//     } finally {
//         modalState.sendEmailModalVisible = false;
//     }
// };
const handleDeleteNoticeConfirm = async () => {
    try {
        await SpaceConnector.client.board.post.delete({
            post_id: props.postId,
            board_id: props.boardId,
        });
        showSuccessMessage(t('INFO.NOTICE.FORM.ALT_S_DELETE_NOTICE'), '');
        await router.push({ name: INFO_ROUTE.NOTICE._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('INFO.NOTICE.FORM.ALT_E_DELETE_NOTICE'));
    } finally {
        modalState.deleteModalVisible = false;
    }
};

const handleClickEditButton = () => {
    router.push({
        name: INFO_ROUTE.NOTICE.UPDATE._NAME,
        params: { boardId: props.boardId, postId: props.postId },
    });
};

// TODO: 이미지 URL 이슈로 인해 v1.10.1에서 제외
// const handleSendEmailModalOpen = () => {
//     modalState.sendEmailModalVisible = true;
// };
const handleDeleteModalOpen = () => {
    modalState.deleteModalVisible = true;
};

const handlePostClick = (direction: 'next'|'prev') => {
    if (direction === 'next') {
        if (!state.nextNoticePost) return;
        router.push(state.nextPostRoute);
    } else {
        if (!state.prevNoticePost) return;
        router.push(state.prevPostRoute);
    }
};

const initPage = async () => {
    state.loading = true;
    await getNoticePostData();
    if (state.hasSystemRoleUser) await getPostDomainName();
    if (state.noticePostData.created_at) {
        await getNextPostData(state.noticePostData.created_at);
        await getPrevPostData(state.noticePostData.created_at);
    }
    const isGetPostSuccess = !!state.noticePostData?.post_id;
    if (isGetPostSuccess) {
        await updateNoticeReadState(props.postId);
    }
    state.loading = false;
};
watch(() => props.postId, () => {
    initPage();
}, { immediate: true });

</script>

<template>
    <section class="notice-detail-page">
        <p-heading :title="state.noticePostData.title"
                   show-back-button
                   @click-back-button="router.go(-1)"
        >
            <template #extra>
                <div v-if="state.hasPermissionToEditOrDelete"
                     class="button-group"
                >
                    <p-button style-type="tertiary"
                              icon-left="ic_edit"
                              @click="handleClickEditButton"
                    >
                        {{ t('INFO.NOTICE.FORM.EDIT') }}
                    </p-button>
                    <!--        TODO: 이미지 URL 이슈로 인해 v1.10.1에서 제외-->
                    <!--                    <p-button :outline="true" style-type="gray-border" icon="ic_paper-airplane">-->
                    <!--                        {{ t('Send Email') }}-->
                    <!--                    </p-button>-->
                    <p-button style-type="negative-secondary"
                              @click="handleDeleteModalOpen"
                    >
                        {{ t('INFO.NOTICE.FORM.DELETE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <p-pane-layout class="notice-detail-page-layout">
            <p-data-loader :loading="state.loading"
                           :data="state.noticePostData"
            >
                <div class="post-title">
                    <p-badge badge-type="solid-outline"
                             :style-type="state.noticeTypeBadgeInfo.style"
                    >
                        {{ state.noticeTypeBadgeInfo.label }}
                    </p-badge>
                    <span>{{ iso8601Formatter(state.noticePostData.created_at, state.timezone) }}
                    </span><p-i width="0.125rem"
                                name="ic_dot"
                    />
                    <span> {{ state.noticePostData.writer }}</span>
                    <p-i v-if="state.hasDomainRoleUser || state.hasSystemRoleUser"
                         width="0.125rem"
                         name="ic_dot"
                    />
                    <span v-if="state.hasDomainRoleUser || state.hasSystemRoleUser"
                          class="view-count"
                    >
                        <p-i name="ic_eye"
                             width="1.125rem"
                        /> {{ state.noticePostData.view_count }}
                    </span>
                    <span v-if="state.hasSystemRoleUser"
                          class="view-count"
                    >| {{ state.postDomainName }}</span>
                </div>
                <p-divider />
                <div class="text-editor-wrapper">
                    <text-editor-viewer :contents="state.noticePostData.contents"
                                        :attachments="attachments"
                    />
                </div>
            </p-data-loader>
        </p-pane-layout>
        <p-pane-layout class="post-router">
            <div class="post-router-item">
                <list-item :post-direction="state.nextNoticePost ? 'next' : undefined"
                           :post="state.nextNoticePost"
                           @click="handlePostClick('next')"
                />
            </div>
            <p-divider />
            <div class="post-router-item">
                <list-item :post-direction="state.prevNoticePost ? 'prev' : undefined"
                           :post="state.prevNoticePost"
                           @click="handlePostClick('prev')"
                />
            </div>
        </p-pane-layout>
        <section class="back-to-list-button-section">
            <p-button class="back-to-list-button"
                      style-type="tertiary"
                      @click="handleBackToListButtonClick"
            >
                {{ t('INFO.NOTICE.DETAIL.BACK_TO_LIST') }}
            </p-button>
        </section>
        <!--        TODO: 이미지 URL 이슈로 인해 v1.10.1에서 제외-->
        <!--        <p-button-modal :header-title="t('INFO.NOTICE.FORM.SEND_EMAIL_MODAL_TITLE')"-->
        <!--                        :visible.sync="sendEmailModalVisible"-->
        <!--                        size="sm"-->
        <!--                        @confirm="handleSendEmailConfirm"-->
        <!--        >-->
        <!--            <template #body>-->
        <!--                <i18n path="INFO.NOTICE.FORM.SEND_EMAIL_MODAL_DESC" tag="p" class="desc">-->
        <!--                    <template #domainText>-->
        <!--                        <strong>{{ domainName }}</strong>-->
        <!--                    </template>-->
        <!--                </i18n>-->
        <!--            </template>-->
        <!--        </p-button-modal>-->

        <delete-modal v-model:visible="state.deleteModalVisible"
                      :header-title="t('INFO.NOTICE.FORM.DELETE_MODAL_TITLE')"
                      :contents="t('INFO.NOTICE.FORM.DELETE_MODAL_CONTENTS')"
                      @confirm="handleDeleteNoticeConfirm"
        />
    </section>
</template>

<style scoped lang="postcss">
.button-group {
    @apply flex gap-2;
}

.notice-detail-page-layout {
    padding: 1.25rem 1.5rem;

    .post-title {
        @apply flex flex-wrap gap-2 items-center text-gray-600;
        font-size: 0.875rem;
        line-height: 1.25;
        margin-bottom: 1rem;
        .view-count {
            @apply flex items-center;
            gap: 0.125rem;
        }
    }
    .text-editor-wrapper {
        margin-top: 1rem;
        margin-left: 0.125rem;
    }
}

.post-router {
    margin-top: 1.5rem;
    .post-router-item {
        display: block;
        margin: 0.5rem 0;
    }
}

.back-to-list-button-section {
    text-align: center;
    margin-top: 1.5rem;
    .back-to-list-button {
        width: 10.9375rem;
    }
}

</style>
