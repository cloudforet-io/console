<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { Location } from 'vue-router';

import {
    PBadge, PButton, PDataLoader, PDivider, PI, PPaneLayout,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import { SpaceRouter } from '@/router';
import type { PostListParameters, PostListResponse } from '@/schema/board/post/api-verbs/list';
import { NOTICE_POST_TYPE } from '@/schema/board/post/constant';
import type { PostModel } from '@/schema/board/post/model';
import type { NoticePostType } from '@/schema/board/post/type';
import type { DomainGetParameters } from '@/schema/identity/domain/api-verbs/get';
import type { DomainModel } from '@/schema/identity/domain/model';
import { store } from '@/store';

import { useNoticeStore } from '@/store/notice';

import type { FileInfo } from '@/lib/file-manager/type';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFileAttachments } from '@/common/composables/file-attachments';

import ListItem from '@/services/info/components/NoticeListItem.vue';
import { getPostBadgeInfo } from '@/services/info/helpers/notice-helper';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';
import type { NoticePostBadgeInfo } from '@/services/info/types/notice-type';

const props = defineProps<{
    postId?: string;
}>();

const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;
const noticeDetailGetters = noticeDetailStore.getters;

const state = reactive({
    timezone: computed(() => store.state.user.timezone),
    loading: false,
    noticePostData: computed<PostModel|undefined>(() => noticeDetailState.post),
    postType: computed<NoticePostType>(() => state.noticePostData?.post_type ?? NOTICE_POST_TYPE.INTERNAL),
    prevNoticePost: undefined as PostModel | undefined,
    prevPostRoute: computed<Location|undefined>(() => {
        if (!noticeDetailGetters.boardId || !state.prevNoticePost) return undefined;
        return {
            name: INFO_ROUTE.NOTICE.DETAIL._NAME,
            params: { boardId: noticeDetailGetters.boardId, postId: state.prevNoticePost.post_id },
        };
    }),
    nextNoticePost: undefined as PostModel | undefined,
    nextPostRoute: computed<Location|undefined>(() => {
        if (!noticeDetailGetters.boardId || !state.nextNoticePost) return undefined;
        return {
            name: INFO_ROUTE.NOTICE.DETAIL._NAME,
            params: { boardId: noticeDetailGetters.boardId, postId: state.nextNoticePost.post_id },
        };
    }),
    domainName: computed<string>(() => store.state.domain.name ?? ''),
    postDomainName: '',
    hasDomainRoleUser: computed<boolean>(() => store.getters['user/hasDomainRole']),
    hasSystemRoleUser: computed<boolean>(() => store.getters['user/hasSystemRole']),
    noticeTypeBadgeInfo: computed<NoticePostBadgeInfo>(() => getPostBadgeInfo(state.noticePostData?.post_type)),
});

const files = computed<FileInfo[]>(() => state.noticePostData?.files ?? []);
const { attachments } = useFileAttachments(files);

/* Api */
const getNextPostData = async (createdAt: string) => {
    try {
        if (!noticeDetailGetters.boardId) throw new Error('boardId is undefined');

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
        const { results } = await SpaceConnector.clientV2.board.post.list<PostListParameters, PostListResponse>({
            domain_id: null,
            board_id: noticeDetailGetters.boardId,
            query: nextPostApiQueryHelper.data,
        });
        state.nextNoticePost = results?.length ? results[0] : undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.nextNoticePost = undefined;
    }
};
const getPrevPostData = async (createdAt: string) => {
    try {
        if (!noticeDetailGetters.boardId) throw new Error('boardId is undefined');

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
        const { results } = await SpaceConnector.clientV2.board.post.list<PostListParameters, PostListResponse>({
            domain_id: null,
            board_id: noticeDetailGetters.boardId,
            query: prevPostApiQueryHelper.data,
        });
        state.prevNoticePost = results?.length ? results[0] : undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.prevNoticePost = undefined;
    }
};
const getPostDomainName = async () => {
    const domainId = state.noticePostData?.domain_id;
    if (!domainId) {
        state.postDomainName = 'All Domains';
        return;
    }
    try {
        const { name } = await SpaceConnector.clientV2.identity.domain.get<DomainGetParameters, DomainModel>({ domain_id: domainId });
        state.postDomainName = name;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.postDomainName = '';
    }
};

const noticeStore = useNoticeStore();

/* Event */
const handleBackToListButtonClick = () => {
    SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE._NAME });
};




const handlePostClick = (direction: 'next'|'prev') => {
    if (direction === 'next') {
        if (!state.nextPostRoute) return;
        SpaceRouter.router.push(state.nextPostRoute);
    } else {
        if (!state.prevPostRoute) return;
        SpaceRouter.router.push(state.prevPostRoute);
    }
};

const initPage = async (postId: string) => {
    state.loading = true;
    await noticeDetailStore.getNoticePost(postId);
    if (state.hasSystemRoleUser) await getPostDomainName();
    if (state.noticePostData?.created_at) {
        await getNextPostData(state.noticePostData.created_at);
        await getPrevPostData(state.noticePostData.created_at);
    }
    const isGetPostSuccess = !!state.noticePostData?.post_id;
    if (isGetPostSuccess) {
        await noticeStore.updateNoticeReadState(postId);
    }
    state.loading = false;
};
watch(() => props.postId, (postId) => {
    if (postId) initPage(postId);
}, { immediate: true });

</script>

<template>
    <section class="notice-detail">
        <p-pane-layout class="notice-detail-layout">
            <p-data-loader :loading="state.loading"
                           :data="state.noticePostData"
            >
                <div v-if="state.noticePostData"
                     class="post-title"
                >
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
                <div v-if="state.noticePostData"
                     class="text-editor-wrapper"
                >
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
                           @click.native="handlePostClick('next')"
                />
            </div>
            <p-divider />
            <div class="post-router-item">
                <list-item :post-direction="state.prevNoticePost ? 'prev' : undefined"
                           :post="state.prevNoticePost"
                           @click.native="handlePostClick('prev')"
                />
            </div>
        </p-pane-layout>
        <section class="back-to-list-button-section">
            <p-button class="back-to-list-button"
                      style-type="tertiary"
                      @click="handleBackToListButtonClick"
            >
                {{ $t('INFO.NOTICE.DETAIL.BACK_TO_LIST') }}
            </p-button>
        </section>
    </section>
</template>

<style scoped lang="postcss">
.notice-detail-layout {
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
