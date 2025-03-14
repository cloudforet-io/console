<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import dayjs from 'dayjs';

import { PI, PSkeleton, PBadge } from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import type { PostModel } from '@/schema/board/post/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import NewMark from '@/common/components/marks/NewMark.vue';
import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const userStore = useUserStore();

const props = withDefaults(defineProps<{
    inputText?: string;
    isNew?: boolean;
    postDirection?: 'prev' | 'next' | undefined;
    post?: PostModel;
    loading?: boolean;
}>(), {
    inputText: '',
    isNew: false,
    postDirection: undefined,
    post: undefined,
    loading: true,
});

const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    timezone: computed<string>(() => userStore.state.timezone || 'UTC'),
    hasDomainRoleUser: computed<boolean>(() => userStore.getters.isDomainAdmin),
});
const state = reactive({
    postDirectionLabel: computed<TranslateResult>(() => ((props.postDirection === 'prev') ? i18n.t('INFO.NOTICE.MAIN.PREV') : i18n.t('INFO.NOTICE.MAIN.NEXT'))),
    date: computed<string>(() => dateFormatter(props.post?.created_at)),
    isPinned: computed<boolean>(() => !!props.post?.options?.is_pinned),
    postDirectionIcon: computed<string>(() => ((props.postDirection === 'prev') ? 'ic_arrow-down' : 'ic_arrow-up')),
    writer: computed<string>(() => {
        if (!props.post) return '';
        return props.post.writer;
    }),
    isAllWorkspace: computed<boolean>(() => (!props.post?.workspaces || props.post?.workspaces?.includes('*')) ?? true),
    scopedWorkspaceList: computed<WorkspaceModel[]|undefined>(() => {
        if (state.isAllWorkspace) return undefined;
        return storeState.workspaceList.filter((workspace) => props.post?.workspaces.includes(workspace.workspace_id));
    }),
});

const dateFormatter = (date?: string): string => {
    if (!date) return '';
    return dayjs.tz(dayjs.utc(date), storeState.timezone).format('YYYY-MM-DD');
};

</script>
<template>
    <component :is="props.postDirection ? 'div' : 'li'"
               class="notice-list-item"
               :class="{ 'pointer': !!props.post }"
    >
        <div v-if="props.postDirection"
             class="post-direction"
             :style="{visibility: props.loading || props.post ? 'visible' : 'hidden'}"
        >
            <span>{{ state.postDirectionLabel }}</span><p-i :name="state.postDirectionIcon"
                                                            width="1rem"
            />
        </div>
        <div v-if="props.loading">
            <div class="skeleton-wrapper">
                <p-skeleton loading
                            width="7rem"
                            height="1.5rem"
                />
                <p-skeleton loading
                            width="15rem"
                            height="1.125rem"
                />
            </div>
        </div>
        <div v-else-if="props.post">
            <div class="title-wrapper">
                <p-i v-if="state.isPinned"
                     class="pin"
                     name="ic_pin-filled"
                     width="1.125rem"
                />
                <text-highlighting class="title-text"
                                   :term="props.inputText"
                                   :text="props.post.title"
                />
                <new-mark v-if="props.isNew"
                          class="new-mark"
                />
            </div>
            <div class="info">
                <span>{{ state.date }}</span>
                <template v-if="storeState.hasDomainRoleUser">
                    <p-i v-if="state.writer"
                         width="0.125rem"
                         name="ic_dot"
                    />
                    <span v-if="state.writer">{{ state.writer }}</span>
                    <p-i width="0.125rem"
                         name="ic_dot"
                    />
                    <span class="view-count"><p-i name="ic_eye"
                                                  width="1.125rem"
                    /> {{ props.post?.view_count ?? 0 }}</span>
                </template>
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
                    </div>
                </div>
            </div>
        </div>
        <div v-else
             class="not-exist-item"
        >
            {{ $t('INFO.NOTICE.MAIN.NO_NEXT_LIST') }}
        </div>
    </component>
</template>

<style scoped lang="postcss">
.notice-list-item {
    @apply border-b border-gray-200 flex;
    padding: 1rem;
    align-items: center;

    &.pointer {
        @media (hover: hover) {
            &:hover {
                @apply bg-blue-100;
                cursor: pointer;
            }
        }
    }

    .title-wrapper {
        display: inline-flex;
        align-items: center;
        margin-bottom: 0.375rem;
        vertical-align: baseline;
        height: 1.5rem;
        .pin {
            margin-right: 0.125rem;
            margin-bottom: 0.1875rem;
        }
        .title-text {
            @apply text-gray-900 font-bold;
            line-height: 1.25;
        }
        .new-mark {
            display: inline-block;
            margin-top: 0.1875rem;
        }
    }
    .info {
        @apply flex flex-wrap gap-2 items-center text-gray-600;
        font-size: 0.875rem;
        line-height: 1.25;
        .view-count {
            @apply flex items-center;
            gap: 0.125rem;
        }
        .workspace-wrapper {
            @apply flex items-center;
            gap: 0.25rem;
        }
    }

    .not-exist-item {
        @apply text-gray-300;
        font-weight: 700;
        font-size: 0.875rem;
        padding: 0.8125rem 0;
        line-height: 1.25;
        text-align: left;
        width: 100%;
    }

    .post-direction {
        @apply flex items-center text-gray-700;
        font-size: 0.75rem;
        line-height: 1.25;
        padding: 1rem 1rem 1rem 0.5rem;
        min-width: 5rem;
        flex-shrink: 0;
    }

    .skeleton-wrapper {
        width: 100%;
        display: flex;
        gap: 0.65rem;
        flex-direction: column;
        height: 100%;
    }
}

.notice-list-item:last-child {
    @apply border-b-0;
}
</style>
