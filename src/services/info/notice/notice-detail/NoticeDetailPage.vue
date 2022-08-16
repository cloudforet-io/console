<template>
    <section class="notice-detail-page">
        <p-page-title :title="noticePostData.title"
                      child
                      @goBack="$router.go(-1)"
        >
            <template #extra>
                <div v-if="hasDomainRoleUser" class="button-group">
                    <!--                    song-lang-->
                    <p-button :outline="true" style-type="gray-border" icon="ic_edit"
                              @click="handleClickEditButton"
                    >
                        {{ $t('Edit') }}
                    </p-button>
                    <!--        TODO: 이미지 URL 이슈로 인해 v1.10.1에서 제외-->
                    <!--                    <p-button :outline="true" style-type="gray-border" icon="ic_send">-->
                    <!--                        {{ $t('Send Email') }}-->
                    <!--                    </p-button>-->
                    <p-button :outline="true" style-type="alert" @click="handleDeleteModalOpen">
                        {{ $t('Delete') }}
                    </p-button>
                </div>
            </template>
        </p-page-title>
        <p-pane-layout class="notice-detail-page-layout">
            <p-data-loader :loading="loading" :data="noticePostData">
                <div class="post-title">
                    <p-badge outline :style-type="noticeTypeBadgeInfo.style">
                        {{ noticeTypeBadgeInfo.label }}
                    </p-badge>
                    <span>{{ iso8601Formatter(noticePostData.created_at, timezone) }}
                    </span><p-i width="0.125rem" name="ic_divider-dot" />
                    <span> {{ noticePostData.writer }}</span>
                    <p-i v-if="hasDomainRoleUser" width="0.125rem" name="ic_divider-dot" />
                    <span v-if="hasDomainRoleUser" class="view-count">
                        <p-i name="ic_view" width="1.125rem" /> {{ noticePostData.view_count }}
                    </span>
                </div>
                <p-divider />
                <div class="text-editor-wrapper">
                    <text-editor-viewer :contents="noticePostData.contents" />
                </div>
            </p-data-loader>
        </p-pane-layout>
        <p-pane-layout class="post-router">
            <router-link :to="nextPostRoute" class="post-router-item">
                <list-item class="" post-direction="next"
                           :post="nextNoticePost"
                />
            </router-link>
            <p-divider />
            <router-link :to="prevPostRoute"
                         class="post-router-item"
            >
                <list-item class="" post-direction="prev"
                           :post="prevNoticePost"
                />
            </router-link>
        </p-pane-layout>
        <section class="back-to-list-button-section">
            <p-button class="back-to-list-button" :outline="true"
                      style-type="gray-border"
                      @click="handleBackToListButtonClick"
            >
                <!-- song-lang-->
                {{ $t('Back to List') }}
            </p-button>
        </section>
        <!--        TODO: 이미지 URL 이슈로 인해 v1.10.1에서 제외-->
        <!--        <p-button-modal :header-title="$t('Send the mail')"-->
        <!--                        :visible.sync="sendEmailModalVisible"-->
        <!--                        size="sm"-->
        <!--                        :scrollable="true"-->
        <!--                        @confirm="handleSendEmailConfirm"-->
        <!--        >-->
        <!--            <template #body>-->
        <!--                <i18n path="song-lang" tag="p" class="desc">-->
        <!--                    <template #domainText>-->
        <!--                        <strong>{{ domainName }}</strong>-->
        <!--                    </template>-->
        <!--                </i18n>-->
        <!--            </template>-->
        <!--        </p-button-modal>-->

        <!--song-lang-->
        <delete-modal :header-title="$t('Delete Notice')"
                      :visible.sync="deleteModalVisible"
                      :contents="$t('Are you sure you want to delete the notice?')"
                      @confirm="handleDeleteNoticeConfirm"
        />
    </section>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { iso8601Formatter } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PBadge, PButton, PDataLoader, PDivider, PI, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import type { TranslateResult } from 'vue-i18n';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { getPostBadgeInfo } from '@/services/info/notice/helper';
import ListItem from '@/services/info/notice/modules/list-item/ListItem.vue';
import type { NoticePostModel } from '@/services/info/notice/type';
import { INFO_ROUTE } from '@/services/info/route-config';

export default {
    name: 'NoticeDetailPage',
    components: {
        TextEditorViewer,
        PPaneLayout,
        PDataLoader,
        PBadge,
        PI,
        PDivider,
        PPageTitle,
        PButton,
        ListItem,
        DeleteModal,
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
            timezone: computed(() => store.state.user.timezone),
            loading: false,
            noticePostData: {} as NoticePostModel,
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
            hasDomainRoleUser: computed(() => store.getters['user/hasDomainRole']),
            noticeTypeBadgeInfo: computed<{ label?: TranslateResult; style?: string }>(() => getPostBadgeInfo(state.noticePostData?.scope)),
        });
        const modalState = reactive({
            deleteModalVisible: false,
            // TODO: send email open state
        });

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
                    .setFilters([{ k: 'created_at', v: createdAt, o: '>' }]);
                const { results } = await SpaceConnector.client.board.post.list({
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
                    .setFilters([{ k: 'created_at', v: createdAt, o: '<' }]);
                const { results } = await SpaceConnector.client.board.post.list({
                    board_id: props.boardId,
                    query: prevPostApiQueryHelper.data,
                });
                state.prevNoticePost = results.length ? results[0] : undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.prevNoticePost = undefined;
            }
        };

        /* Event */
        const handleBackToListButtonClick = () => {
            SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE._NAME });
        };
        // TODO: 이미지 URL 이슈로 인해 v1.10.1에서 제외
        // const handleSendEmailConfirm = async () => {
        //     try {
        //         await SpaceConnector.client.board.post.sendNotification({
        //             post_id: props.postId,
        //             board_id: props.boardId,
        //         });
        //         // song-lang
        //         showSuccessMessage(i18n.t('Successfully Sent Email'), '');
        //     } catch (e) {
        //         // song-lang
        //         ErrorHandler.handleRequestError(e, i18n.t('에러 메시지!'));
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
                // song-lang
                showSuccessMessage(i18n.t('Successfully Deleted Notice'), '');
                SpaceRouter.router.go(-1);
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, i18n.t('에러 메시지!'));
            } finally {
                modalState.deleteModalVisible = false;
            }
        };

        const handleClickEditButton = () => {
            SpaceRouter.router.push({
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

        const initPage = async () => {
            state.loading = true;
            await getNoticePostData();
            if (state.noticePostData.created_at) {
                await getNextPostData(state.noticePostData.created_at);
                await getPrevPostData(state.noticePostData.created_at);
            }
            state.loading = false;
        };
        watch(() => props.postId, () => {
            initPage();
        }, { immediate: true });
        return {
            ...toRefs(state),
            ...toRefs(modalState),
            iso8601Formatter,
            handleBackToListButtonClick,
            handleDeleteNoticeConfirm,
            handleClickEditButton,
            handleDeleteModalOpen,
        };
    },
};
</script>
<style scoped lang="postcss">
.button-group {
    @apply flex flex-wrap gap-2;
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
