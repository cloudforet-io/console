<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PDataLoader, PDivider, PI, PPaneLayout, PBadge, PPopover, PTextButton,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import { usePostApi } from '@/api-clients/board/post/composables/use-post-api';
import { POST_BOARD_TYPE } from '@/api-clients/board/post/schema/constant';
import type { PostModel } from '@/api-clients/board/post/schema/model';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useNoticeStore } from '@/store/notice/notice-store';
import { useUserStore } from '@/store/user/user-store';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import { useEditorContentTransformer } from '@/common/composables/editor-content-transformer';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import NoticeListItem from '@/services/info/components/NoticeListItem.vue';
import { usePostGetQuery } from '@/services/info/composables/use-post-get-query';
import { ADMIN_INFO_ROUTE } from '@/services/info/routes/admin/route-constant';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';

const props = defineProps<{
    postId?: string;
}>();

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const userStore = useUserStore();
const noticeStore = useNoticeStore();

const router = useRouter();

const postId = computed(() => props.postId ?? '');

const { postData } = usePostGetQuery(postId);

const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const state = reactive({
    loading: false,
    currentPostIndex: computed<number>(() => {
        if (!postData.value) return 0;
        return postList.value?.results?.findIndex((post) => post.post_id === postData.value?.post_id) ?? 0;
    }),
    prevNoticePost: computed<PostModel|undefined>(() => postList.value?.results?.[state.currentPostIndex + 1]),
    prevPostRoute: computed<Location|undefined>(() => {
        if (!state.prevNoticePost) return undefined;
        const noticeDetailRouteName = storeState.isAdminMode ? ADMIN_INFO_ROUTE.NOTICE.DETAIL._NAME : INFO_ROUTE.NOTICE.DETAIL._NAME;
        return {
            name: noticeDetailRouteName,
            params: { postId: state.prevNoticePost.post_id },
        };
    }),
    nextNoticePost: computed<PostModel|undefined>(() => postList.value?.results?.[state.currentPostIndex - 1]),
    nextPostRoute: computed<Location|undefined>(() => {
        if (!state.nextNoticePost) return undefined;
        const noticeDetailRouteName = storeState.isAdminMode ? ADMIN_INFO_ROUTE.NOTICE.DETAIL._NAME : INFO_ROUTE.NOTICE.DETAIL._NAME;
        return {
            name: noticeDetailRouteName,
            params: { postId: state.nextNoticePost.post_id },
        };
    }),
    hasDomainRoleUser: computed<boolean>(() => userStore.getters.isDomainAdmin),
    isAllWorkspace: computed<boolean>(() => (!postData.value?.workspaces || postData.value?.workspaces?.includes('*')) ?? true),
    scopedWorkspaceList: computed<WorkspaceModel[]|undefined>(() => {
        if (state.isAllWorkspace) return undefined;
        return storeState.workspaceList.filter((workspace) => postData.value?.workspaces?.includes(workspace.workspace_id));
    }),
    popoverVisible: false,
});

const contentsType = computed(() => postData.value?.contents_type ?? 'markdown');
const {
    editorContents,
} = useEditorContentTransformer({
    contents: computed(() => postData.value?.contents ?? ''),
    contentsType,
    resourceGroup: 'DOMAIN',
});

/* Api */
const noticeApiHelper = new ApiQueryHelper().setMultiSort([{ key: 'options.is_pinned', desc: true }, { key: 'created_at', desc: true }]);
const { postAPI } = usePostApi();
const { key: postListQueryKey, params: postListQueryParams } = useServiceQueryKey('board', 'post', 'list', {
    params: computed(() => ({
        query: noticeApiHelper.data,
        board_type: POST_BOARD_TYPE.NOTICE,
    })),
});
const { data: postList } = useScopedQuery({
    queryKey: postListQueryKey,
    queryFn: () => postAPI.list(postListQueryParams.value),
}, ['DOMAIN']);

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

const initPage = async (id: string) => {
    state.loading = true;
    const isGetPostSuccess = !!postData.value?.post_id;
    if (isGetPostSuccess) {
        await noticeStore.updateNoticeReadState(id);
    }
    state.loading = false;
};
watch(() => props.postId, (id) => {
    if (id) initPage(id);
}, { immediate: true });

</script>

<template>
    <section class="notice-detail">
        <p-pane-layout class="notice-detail-layout">
            <p-data-loader :loading="state.loading"
                           :data="postData"
            >
                <div v-if="postData"
                     class="post-title"
                >
                    <span>
                        {{ iso8601Formatter(postData?.created_at || '', storeState.timezone) }}
                    </span>
                    <p-i v-if="postData?.writer"
                         width="0.125rem"
                         name="ic_dot"
                    />
                    <span v-if="postData?.writer"> {{ postData.writer }}</span>
                    <p-i v-if="state.hasDomainRoleUser"
                         width="0.125rem"
                         name="ic_dot"
                    />
                    <span v-if="state.hasDomainRoleUser"
                          class="view-count"
                    >
                        <p-i name="ic_eye"
                             width="1.125rem"
                        /> {{ postData?.view_count }}
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
                <div v-if="postData"
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
