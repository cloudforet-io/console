<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PDataLoader, PI, PDivider, PEmpty,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PostListParameters } from '@/schema/board/post/api-verbs/list';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { PostModel } from '@/schema/board/post/model';
import { i18n } from '@/translations';

import { useNoticeStore } from '@/store/notice';

import ErrorHandler from '@/common/composables/error/errorHandler';
import GNBNotiItem from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotiItem.vue';

import { INFO_ROUTE } from '@/services/info/routes/route-constant';

interface NoticeItem {
    postId: string;
    createdAt: string;
    title: string;
    writer: string;
    isPinned: boolean;
}

const NOTICE_ITEM_LIMIT = 15;

const emit = defineEmits<{(event: 'close'): void;
}>();

const state = reactive({
    loading: true,
    noticeData: [] as PostModel[],
    items: computed<NoticeItem[]>(() => {
        const filteredData = state.noticeData.filter((d) => !d.options.is_pinned);
        return convertNoticeItem(filteredData);
    }),
    pinnedItems: computed<NoticeItem[]>(() => {
        const filteredData = state.noticeData.filter((d) => d.options.is_pinned);
        const res = convertNoticeItem(filteredData);
        console.debug('pinnedItems', res);
        return res;
    }),
});

/* Util */
const convertNoticeItem = (rawData: PostModel[]): NoticeItem[] => rawData.map((d) => ({
    postId: d.post_id,
    createdAt: d.created_at,
    title: d.title,
    writer: d.writer,
    isPinned: d.options.is_pinned,
}));

const noticeStore = useNoticeStore();
const noticeGetters = noticeStore.getters;

/* Api */
const noticeApiHelper = new ApiQueryHelper()
    .setPage(1, NOTICE_ITEM_LIMIT)
    .setMultiSort([{ key: 'is_pinned', desc: true }, { key: 'created_at', desc: true }]);
const listNotice = async () => {
    try {
        const { results, total_count } = await SpaceConnector.clientV2.board.post.list<PostListParameters, ListResponse<PostModel>>({
            query: noticeApiHelper.data,
            board_type: POST_BOARD_TYPE.NOTICE,
        });
        state.proxyCount = total_count ?? 0;
        state.noticeData = results ?? [];
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
        state.proxyCount = 0;
        state.noticeData = [];
    }
};

/* Event */
const handleSelectNotice = (postId: string) => {
    emit('close');
    SpaceRouter.router.push({
        name: INFO_ROUTE.NOTICE.DETAIL._NAME,
        params: { postId },
    }).catch(() => {});
};
const handleClickViewAllNotice = () => {
    emit('close');
    SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE._NAME }).catch(() => {});
};

/* Init */
const init = async () => {
    state.loading = true;
    await Promise.allSettled([noticeStore.fetchNoticeReadState(), listNotice()]);
    state.loading = false;
};
(async () => {
    await init();
})();

</script>

<template>
    <div class="gnb-notice-tab">
        <p-data-loader :data="state.items"
                       :loading="state.loading"
                       :class="{ loading: state.loading && !state.items.length }"
        >
            <div class="content-wrapper">
                <template v-if="!!state.pinnedItems.length">
                    <div class="pinned-header-wrapper">
                        <p-i name="ic_pin-filled"
                             width="1rem"
                             height="1rem"
                             class="mr-1"
                        />
                        <span class="label">{{ $t('COMMON.GNB.NOTICE.PINNED_NOTICE') }}</span>
                    </div>
                    <g-n-b-noti-item v-for="(item, idx) in state.pinnedItems"
                                     :key="`${item.postId}-${idx}`"
                                     :title="item.title"
                                     :created-at="item.createdAt"
                                     :is-read="!!noticeGetters.isReadMap[item.postId]"
                                     :writer="item.writer"
                                     @select="handleSelectNotice(item.postId)"
                    />
                    <p-divider class="divider" />
                </template>
                <g-n-b-noti-item v-for="(item, idx) in state.items"
                                 :key="`${item.postId}-${idx}`"
                                 :title="item.title"
                                 :created-at="item.createdAt"
                                 :is-read="noticeGetters.isReadMap[item.postId]"
                                 :writer="item.writer"
                                 @select="handleSelectNotice(item.postId)"
                />
            </div>
            <div class="view-all-button-wrapper">
                <div class="view-all-button"
                     @click="handleClickViewAllNotice"
                >
                    {{ $t('COMMON.GNB.NOTICE.VIEW_ALL') }}
                </div>
            </div>
            <template #no-data>
                <p-empty
                    show-image
                    :title="$t('COMMON.GNB.NOTICE.NO_NOTICE')"
                >
                    <template #image>
                        <img alt="empty-image"
                             src="@/assets/images/illust_ghost.svg"
                        >
                    </template>
                    {{ $t('COMMON.GNB.NOTICE.NO_NOTICE_DESC') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-notice-tab {
    @apply bg-white;
    display: flex;
    flex-direction: column;

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 13rem;
        }
        .data-loader-container {
            .no-data-wrapper {
                position: relative;
                max-height: inherit;
            }
        }
    }
    .content-wrapper {
        max-height: calc(100vh - $gnb-height - 1.5rem - 2.75rem);
        overflow-y: scroll;
        padding: 0.25rem 0.5rem 3.5rem 0.5rem;
        .pinned-header-wrapper {
            @apply text-gray-500 flex items-center;
            font-size: 0.75rem;
            font-weight: 700;
            line-height: 1.5;
            margin-top: 0.75rem;
            margin-bottom: 0.75rem;
            padding: 0 0.75rem;
        }
        .divider {
            margin: 0.5rem 0;
        }
    }
    .view-all-button-wrapper {
        @apply bg-white border-t border-gray-200;
        position: absolute;
        bottom: 0;
        height: 3rem;
        width: 100%;
        padding: 0.5rem;
        .view-all-button {
            display: flex;
            cursor: pointer;
            font-size: 0.875rem;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;

            @media (hover: hover) {
                &:hover {
                    @apply bg-primary-4 text-primary rounded;
                }
            }
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    text-align: center;
    padding: 4rem 3.25rem;
}
</style>
