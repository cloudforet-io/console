<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PDataLoader, PDivider, PI, PPaneLayout, PBadge, PPopover, PTextButton,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import type { PostListParameters } from '@/schema/board/post/api-verbs/list';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { PostModel } from '@/schema/board/post/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useNoticeStore } from '@/store/notice/notice-store';
import { useUserStore } from '@/store/user/user-store';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import { useEditorContentTransformer } from '@/common/composables/editor-content-transformer';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import NoticeListItem from '@/services/info/components/NoticeListItem.vue';
import { ADMIN_INFO_ROUTE } from '@/services/info/routes/admin/route-constant';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';

const props = defineProps<{
    postId?: string;
}>();

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const userStore = useUserStore();
const router = useRouter();

const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const state = reactive({
    loading: false,
    noticePostData: computed<PostModel|undefined>(() => noticeDetailState.post),
    prevNoticePost: undefined as PostModel | undefined,
    prevPostRoute: computed<Location|undefined>(() => {
        if (!state.prevNoticePost) return undefined;
        const noticeDetailRouteName = storeState.isAdminMode ? ADMIN_INFO_ROUTE.NOTICE.DETAIL._NAME : INFO_ROUTE.NOTICE.DETAIL._NAME;
        return {
            name: noticeDetailRouteName,
            params: { postId: state.prevNoticePost.post_id },
        };
    }),
    nextNoticePost: undefined as PostModel | undefined,
    nextPostRoute: computed<Location|undefined>(() => {
        if (!state.nextNoticePost) return undefined;
        const noticeDetailRouteName = storeState.isAdminMode ? ADMIN_INFO_ROUTE.NOTICE.DETAIL._NAME : INFO_ROUTE.NOTICE.DETAIL._NAME;
        return {
            name: noticeDetailRouteName,
            params: { postId: state.nextNoticePost.post_id },
        };
    }),
    hasDomainRoleUser: computed<boolean>(() => userStore.getters.isDomainAdmin),
    isAllWorkspace: computed<boolean>(() => (!state.noticePostData?.workspaces || state.noticePostData?.workspaces?.includes('*')) ?? true),
    scopedWorkspaceList: computed<WorkspaceModel[]|undefined>(() => {
        if (state.isAllWorkspace) return undefined;
        return storeState.workspaceList.filter((workspace) => state.noticePostData?.workspaces.includes(workspace.workspace_id));
    }),
    popoverVisible: false,
});

const contentsType = computed(() => state.noticePostData?.contents_type ?? 'markdown');
const {
    editorContents,
} = useEditorContentTransformer({
    contents: computed(() => state.noticePostData?.contents ?? ''),
    contentsType,
    resourceGroup: 'DOMAIN',
});

/* Api */
const getNextPostData = async (createdAt: string) => {
    try {
        const nextPostApiQueryHelper = new ApiQueryHelper()
            .setPage(1, 1)
            .setSort('created_at', false)
            .setTimezone('UTC')
            .setFilters([{ k: 'created_at', v: createdAt, o: '>t' }]);
        const { results } = await SpaceConnector.clientV2.board.post.list<PostListParameters, ListResponse<PostModel>>({
            query: nextPostApiQueryHelper.data,
            board_type: POST_BOARD_TYPE.NOTICE,
        });
        state.nextNoticePost = results?.length ? results[0] : undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.nextNoticePost = undefined;
    }
};
const getPrevPostData = async (createdAt: string) => {
    try {
        const prevPostApiQueryHelper = new ApiQueryHelper()
            .setPage(1, 1)
            .setSort('created_at', true)
            .setTimezone('UTC')
            .setFilters([{ k: 'created_at', v: createdAt, o: '<t' }]);
        const { results } = await SpaceConnector.clientV2.board.post.list<PostListParameters, ListResponse<PostModel>>({
            query: prevPostApiQueryHelper.data,
            board_type: POST_BOARD_TYPE.NOTICE,
        });
        state.prevNoticePost = results?.length ? results[0] : undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.prevNoticePost = undefined;
    }
};

const noticeStore = useNoticeStore();

/* Event */
const handleBackToListButtonClick = () => {
    const noticeRouteName = storeState.isAdminMode ? ADMIN_INFO_ROUTE.NOTICE._NAME : INFO_ROUTE.NOTICE._NAME;
    router.push({ name: noticeRouteName });
};




const handlePostClick = (direction: 'next'|'prev') => {
    if (direction === 'next') {
        if (!state.nextPostRoute) return;
        router.push(state.nextPostRoute).catch(() => {});
    } else {
        if (!state.prevPostRoute) return;
        router.push(state.prevPostRoute).catch(() => {});
    }
};

const initPage = async (postId: string) => {
    state.loading = true;
    await noticeDetailStore.getNoticePost(postId);
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
                    <span>
                        {{ iso8601Formatter(state.noticePostData.created_at, storeState.timezone) }}
                    </span>
                    <p-i v-if="state.noticePostData.writer"
                         width="0.125rem"
                         name="ic_dot"
                    />
                    <span v-if="state.noticePostData.writer"> {{ state.noticePostData.writer }}</span>
                    <p-i v-if="state.hasDomainRoleUser"
                         width="0.125rem"
                         name="ic_dot"
                    />
                    <span v-if="state.hasDomainRoleUser"
                          class="view-count"
                    >
                        <p-i name="ic_eye"
                             width="1.125rem"
                        /> {{ state.noticePostData.view_count }}
                    </span>
                    <p-i v-if="storeState.isAdminMode"
                         width="0.125rem"
                         name="ic_dot"
                    />
                    <div v-if="storeState.isAdminMode">
                        <span v-if="state.isAllWorkspace">{{ $t('INFO.NOTICE.ALL_WORKSPACE') }}</span>
                        <div v-else
                             class="workspace-wrapper"
                        >
                            <workspace-logo-icon :text="state.scopedWorkspaceList[0]?.name || ''"
                                                 :theme="state.scopedWorkspaceList[0]?.tags?.theme"
                                                 size="xxs"
                            />
                            <span>{{ state.scopedWorkspaceList[0]?.name }}</span>
                            <p-badge v-if="state.scopedWorkspaceList?.length > 1"
                                     style-type="blue200"
                                     badge-type="subtle"
                            >
                                + {{ state.scopedWorkspaceList?.length - 1 }}
                            </p-badge>
                            <p-popover v-if="state.scopedWorkspaceList?.length > 1"
                                       :is-visible.sync="state.popoverVisible"
                                       position="bottom"
                            >
                                <p-text-button class="show-workspaces"
                                               style-type="highlight"
                                               size="sm"
                                               @click="state.popoverVisible = !state.popoverVisible"
                                >
                                    {{ $t('INFO.NOTICE.DETAIL.SHOW_ALL_WORKSPACES') }}
                                </p-text-button>
                                <template #content>
                                    <div class="workspace-list">
                                        <div v-for="(item,idx) in state.scopedWorkspaceList"
                                             :key="idx"
                                             class="workspace-list-item"
                                        >
                                            <workspace-logo-icon :text="item?.name || ''"
                                                                 :theme="item?.tags?.theme"
                                                                 size="xxs"
                                            />
                                            <span>{{ item?.name }}</span>
                                        </div>
                                    </div>
                                </template>
                            </p-popover>
                        </div>
                    </div>
                </div>
                <p-divider />
                <div v-if="state.noticePostData"
                     class="text-editor-wrapper"
                >
                    <text-editor-viewer :contents="editorContents"
                                        :contents-type="contentsType"
                    />
                </div>
            </p-data-loader>
        </p-pane-layout>
        <p-pane-layout class="post-router">
            <div class="post-router-item">
                <notice-list-item post-direction="next"
                                  :post="state.nextNoticePost"
                                  :loading="state.loading"
                                  @click.native="handlePostClick('next')"
                />
            </div>
            <p-divider />
            <div class="post-router-item">
                <notice-list-item post-direction="prev"
                                  :post="state.prevNoticePost"
                                  :loading="state.loading"
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
    min-height: calc(100vh - 35rem);
    >.p-data-loader {
        min-height: inherit;
    }

    .post-title {
        @apply flex flex-wrap gap-2 items-center text-gray-600;
        font-size: 0.875rem;
        line-height: 1.25;
        margin-bottom: 1rem;
        .view-count {
            @apply flex items-center;
            gap: 0.125rem;
        }
        .workspace-wrapper {
            @apply flex items-center;
            gap: 0.25rem;

            /* custom design-system component - p-popover */
            :deep(.p-popover) {
                .popper {
                    padding-right: 2rem;
                }
                .popper-content-wrapper {
                    @apply flex-col;
                    gap: 0.5rem;
                }
            }

            .workspace-list {
                @apply flex flex-col gap-2;
                .workspace-list-item {
                    @apply flex items-center pl-1 pr-4 gap-1;
                }
            }
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
