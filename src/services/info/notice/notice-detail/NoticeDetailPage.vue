<template>
    <section class="notice-detail-page">
        <p-page-title :title="noticePostData.title"
                      child
                      @goBack="$router.go(-1)"
        >
            <template #extra>
                <div v-if="hasDomainRoleUser" class="button-group">
                    <!--                    song-lang-->
                    <p-button :outline="true" style-type="gray-border" icon="ic_edit">
                        {{ $t('Edit') }}
                    </p-button>
                    <p-button :outline="true" style-type="gray-border" icon="ic_send"
                              @click="handleSendEmailModalOpen"
                    >
                        {{ $t('Send Email') }}
                    </p-button>
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
                <text-editor-viewer :contents="noticePostData.contents" />
            </p-data-loader>
        </p-pane-layout>
        <p-pane-layout class="post-router">
            <div class="post-router-item">
                <list-item class="" :title="nextNoticePost.title"
                           post-direction="next"
                           :notice-type="nextNoticePost.scope"
                           :is-pinned="nextNoticePost.options.is_pinned"
                />
            </div>
            <p-divider />
            <div class="post-router-item">
                <list-item class="" :title="nextNoticePost.title"
                           post-direction="prev"
                           :notice-type="nextNoticePost.scope"
                           :is-pinned="nextNoticePost.options.is_pinned"
                />
            </div>
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
        <!--song-lang-->
        <p-button-modal :header-title="$t('Send the mail')"
                        :visible.sync="sendEmailModalVisible"
                        size="sm"
                        :scrollable="true"
                        @confirm="handleSendEmailConfirm"
        >
            <template #body>
                <i18n path="song-lang" tag="p" class="desc">
                    <template #domainText>
                        <strong>{{ domainName }}</strong>
                    </template>
                </i18n>
            </template>
        </p-button-modal>
        <delete-modal :header-title="$t('Delete Notice')"
                      :visible.sync="deleteModalVisible"
                      :contents="$t('Are you sure you want to delete the notice?')"
                      @confirm="handleDeleteNoticeConfirm"
        />
    </section>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import { iso8601Formatter } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PBadge, PButton, PButtonModal, PDataLoader, PDivider, PI, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import type { TranslateResult } from 'vue-i18n';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

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
        PButtonModal,
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
            loading: true,
            noticePostData: {} as NoticePostModel|unknown,
            prevNoticePost: {
                board_id: 'board-14a09a71f504',
                post_id: 'post-d4e6373b3c3f',
                title: '[작업 공지] 시스템 안정화를 위해 작업을 진행합니다.',
                contents: '',
                view_count: 1,
                writer: 'sulmo',
                scope: 'DOMAIN',
                created_at: '2022-08-05T10:53:04.918Z',
                updated_at: '2022-08-05T10:53:04.918Z',
                options: {
                    is_pinned: true,
                },
            },
            nextNoticePost: {
                board_id: 'board-14a09a71f504',
                post_id: 'post-d4e6373b3c3f',
                title: '[작업 공지] 시스템 안정화를 위해 작업을 진행합니다.',
                contents: '',
                view_count: 1,
                writer: 'sulmo',
                scope: 'DOMAIN',
                created_at: '2022-08-05T10:53:04.918Z',
                updated_at: '2022-08-05T10:53:04.918Z',
                options: {
                    is_pinned: true,
                },
            },
            hasDomainRoleUser: computed(() => store.getters['user/hasDomainRole']),
            noticeTypeBadgeInfo: computed<{ label?: TranslateResult; style?: string }>(() => getPostBadgeInfo(state.noticePostData?.scope)),
            domainName: 'Samsung',
        });
        const modalState = reactive({
            deleteModalVisible: false,
            sendEmailModalVisible: false,
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
            }
        };

        /* Event */
        const handleBackToListButtonClick = () => {
            SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE._NAME });
        };
        const handleSendEmailConfirm = () => {
            try {
                // TODD:: Notice send email API
            } catch (e) {
                // TODD:: Error Handling
            } finally {
                modalState.sendEmailModalVisible = false;
            }
        };
        const handleDeleteNoticeConfirm = () => {
            try {
                // TODD:: Notice delete API
            } catch (e) {
                // TODD:: Error Handling
            } finally {
                modalState.deleteModalVisible = false;
            }
        };
        const handleSendEmailModalOpen = () => {
            modalState.sendEmailModalVisible = true;
        };
        const handleDeleteModalOpen = () => {
            modalState.deleteModalVisible = true;
        };

        (async () => {
            state.loading = true;
            await getNoticePostData();
            state.loading = false;
        })();
        return {
            ...toRefs(state),
            ...toRefs(modalState),
            iso8601Formatter,
            handleBackToListButtonClick,
            handleSendEmailConfirm,
            handleDeleteNoticeConfirm,
            handleSendEmailModalOpen,
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
}

.post-router {
    margin-top: 1.5rem;
    .post-router-item {
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
